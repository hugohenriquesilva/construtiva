import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface Profession {
    id: string;
    name: string;
}

const professionsRef = collection(db, 'professions');

// Formato gravado no banco: MAIÚSCULAS e sem espaços nas pontas (os do meio são mantidos)
export function normalizeProfessionName(name: string): string {
    return name.trim().toUpperCase();
}

// Chave usada só para detectar duplicatas: ignora acentos ("ELÉTRICA" == "ELETRICA")
export function professionDuplicateKey(name: string): string {
    return normalizeProfessionName(name).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Listar profissões em ordem alfabética
export async function listProfessions(): Promise<Profession[]> {
    const snap = await getDocs(query(professionsRef, orderBy('name')));
    return snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
}

// Verifica se já existe outra profissão com o mesmo nome (ignorando acentos)
async function isDuplicate(name: string, ignoreId?: string): Promise<boolean> {
    const snap = await getDocs(
        query(professionsRef, where('normalizedName', '==', professionDuplicateKey(name)))
    );
    return snap.docs.some((d) => d.id !== ignoreId);
}

function validateName(name: string): string {
    const normalized = normalizeProfessionName(name);
    if (!normalized) throw new Error('profession-empty');
    return normalized;
}

// Criar profissão (somente admin, garantido pelas regras do Firestore)
export async function createProfession(name: string): Promise<void> {
    const normalized = validateName(name);
    if (await isDuplicate(normalized)) throw new Error('profession-duplicate');

    const now = new Date().toISOString();
    await addDoc(professionsRef, {
        name: normalized,
        normalizedName: professionDuplicateKey(normalized),
        createdAt: now,
        updatedAt: now,
    });
}

// Renomear profissão. Os portfólios guardam o id, então nenhum deles precisa ser alterado
export async function updateProfession(id: string, name: string): Promise<void> {
    const normalized = validateName(name);
    if (await isDuplicate(normalized, id)) throw new Error('profession-duplicate');

    await updateDoc(doc(db, 'professions', id), {
        name: normalized,
        normalizedName: professionDuplicateKey(normalized),
        updatedAt: new Date().toISOString(),
    });
}

// Quantos portfólios usam a profissão (como principal ou secundária)
export async function countPortfoliosUsingProfession(id: string): Promise<number> {
    const portfoliosRef = collection(db, 'portfolios');
    const [asMain, asSecondary] = await Promise.all([
        getCountFromServer(query(portfoliosRef, where('mainProfessionId', '==', id))),
        getCountFromServer(query(portfoliosRef, where('secondaryProfessionIds', 'array-contains', id))),
    ]);
    // Uma profissão não pode ser principal e secundária no mesmo portfólio, então não há contagem dupla
    return asMain.data().count + asSecondary.data().count;
}

// Excluir profissão. Bloqueia se algum portfólio ainda a utiliza
export async function deleteProfession(id: string): Promise<void> {
    const inUse = await countPortfoliosUsingProfession(id);
    if (inUse > 0) throw new Error(`profession-in-use:${inUse}`);

    await deleteDoc(doc(db, 'professions', id));
}
