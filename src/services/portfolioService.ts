import {
    collection,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    increment,
    writeBatch,
} from 'firebase/firestore';
import {
    ref,
    deleteObject,
    listAll,
} from 'firebase/storage';
import { db, storage, auth } from '../../firebaseConfig';
import { uploadServiceImageToStorage } from './imageStorageService';
import { CompleteProfessional, Professional } from '../../types/home';
import { ProfessionalFormData } from '../../types/professionalForm';
import { UserRole } from '../../types/user';

export interface PortfolioData {
    displayName: string;
    whatsappPhoneNumber?: string;
    mainProfessionId: string | null;
    secondaryProfessionIds: string[];
    hasCnpj: boolean;
    cnpj: string;
    experienceRange: string | null;
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    radiusKm: number;
    aboutMe: string;
    photoUri: string | null;
    servicePhotos: (string | null)[];
    isActive: boolean;
    updatedAt: string;
    likesCount?: number;
}

// Salvar ou atualizar portfólio
export async function savePortfolio(formData: ProfessionalFormData): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuário não autenticado');
    if (formData.secondaryProfessionIds.length > 3) {
        throw new Error('Selecione no máximo 3 profissões secundárias.');
    }

    try {
        const portfolioRef = doc(db, 'portfolios', uid);

        // Uploads em paralelo (foto de perfil e fotos de serviço); só sobem as fotos locais,
        // as que já são URL remota foram enviadas antes. A role é lida ao mesmo tempo.
        const [photoUrl, servicePhotosUrls, currentRole] = await Promise.all([
            formData.photoUri && !formData.photoUri.startsWith('http')
                ? uploadServiceImageToStorage(formData.photoUri, `portfolios/${uid}/avatar`)
                : Promise.resolve(formData.photoUri),
            Promise.all(
                formData.servicePhotos.map(async (uri, index): Promise<string | null> => {
                    if (!uri) return null;
                    if (!uri.startsWith('http')) {
                        return await uploadServiceImageToStorage(
                            uri,
                            `portfolios/${uid}/service_${index}`,
                        );
                    }
                    return uri; // já é URL
                })
            ),
            getUserRole(uid),
        ]);

        const portfolioData: PortfolioData = {
            displayName: formData.displayName,
            whatsappPhoneNumber: formData.whatsappPhoneNumber.replace(/\D/g, ''),
            mainProfessionId: formData.mainProfessionId,
            secondaryProfessionIds: formData.secondaryProfessionIds,
            hasCnpj: formData.hasCnpj,
            cnpj: formData.cnpj,
            experienceRange: formData.experienceRange,
            zipCode: formData.zipCode,
            street: formData.street,
            neighborhood: formData.neighborhood,
            city: formData.city,
            radiusKm: formData.radiusKm,
            aboutMe: formData.aboutMe,
            photoUri: photoUrl,
            servicePhotos: servicePhotosUrls,
            isActive: formData.isActive,
            updatedAt: new Date().toISOString(),
        };

        // Portfólio e role gravados juntos: quem tem portfólio passa a ser "professional" (admin nunca muda)
        const userRef = doc(db, 'users', uid);
        const batch = writeBatch(db);
        batch.set(portfolioRef, portfolioData, { merge: true });
        if (currentRole !== 'admin' && currentRole !== 'professional') {
            batch.update(userRef, { role: 'professional' });
        }
        await batch.commit();
    } catch (error) {
        console.error('Erro ao salvar portfólio:', error);
        throw error;
    }
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return (snap.data()?.role as UserRole | undefined) ?? null;
}

// Carregar portfólio
export async function getPortfolio(uid?: string): Promise<PortfolioData | null> {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    try {
        const portfolioRef = doc(db, 'portfolios', userId);
        const portfolioSnap = await getDoc(portfolioRef);

        if (portfolioSnap.exists()) {
            return portfolioSnap.data() as PortfolioData;
        }
        return null;
    } catch (error) {
        console.error('Erro ao carregar portfólio:', error);
        throw error;
    }
}

// Verificar se usuário tem portfólio
export async function hasPortfolio(uid?: string): Promise<boolean> {
    try {
        const portfolio = await getPortfolio(uid);
        return portfolio !== null;
    } catch (error) {
        console.error('Erro ao verificar portfólio:', error);
        return false;
    }
}

// Upload de imagem para Storage
// Verificar se o usuário logado já curtiu o portfólio
export async function isPortfolioLikedByUser(portfolioUid: string, userUid: string): Promise<boolean> {
    const likeRef = doc(db, 'portfolios', portfolioUid, 'likes', userUid);
    const snap = await getDoc(likeRef);
    return snap.exists();
}

// Curtir ou descurtir o portfólio, mantendo o contador em portfolios/{uid}.likesCount em sincronia
export async function togglePortfolioLike(
    portfolioUid: string,
    userUid: string,
    currentlyLiked: boolean
): Promise<void> {
    const likeRef = doc(db, 'portfolios', portfolioUid, 'likes', userUid);
    const portfolioRef = doc(db, 'portfolios', portfolioUid);
    const batch = writeBatch(db);

    if (currentlyLiked) {
        batch.delete(likeRef);
        batch.update(portfolioRef, { likesCount: increment(-1) });
    } else {
        batch.set(likeRef, { uid: userUid, likedAt: new Date().toISOString() });
        batch.update(portfolioRef, { likesCount: increment(1) });
    }

    await batch.commit();
}

// Deletar portfólio e suas imagens
export async function deletePortfolio(uid?: string): Promise<void> {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    try {
        // Deletar documento e voltar a role para "client" (admin nunca muda)
        const portfolioRef = doc(db, 'portfolios', userId);
        const currentRole = await getUserRole(userId);
        const batch = writeBatch(db);
        batch.delete(portfolioRef);
        if (currentRole === 'professional') {
            batch.update(doc(db, 'users', userId), { role: 'client' });
        }
        await batch.commit();

        // Deletar pasta de imagens do Storage (opcional, mas recomendado)
        // Você pode adicionar isso depois se quiser
    } catch (error) {
        console.error('Erro ao deletar portfólio:', error);
        throw error;
    }
}

// Excluir o portfólio de outro profissional (somente admin, garantido pelas regras do Firestore).
// Remove curtidas, portfólio, localização e imagens e volta a role para "client".
// As denúncias em "denuncias" são mantidas como histórico.
export async function deletePortfolioAsAdmin(uid: string): Promise<void> {
    const likesSnap = await getDocs(collection(db, 'portfolios', uid, 'likes'));
    const likeRefs = likesSnap.docs.map((d) => d.ref);

    // Um lote aceita até 500 operações: as curtidas que não couberem vão em lotes anteriores
    while (likeRefs.length > 498) {
        const likesBatch = writeBatch(db);
        likeRefs.splice(0, 450).forEach((likeRef) => likesBatch.delete(likeRef));
        await likesBatch.commit();
    }

    const batch = writeBatch(db);
    likeRefs.forEach((likeRef) => batch.delete(likeRef));
    batch.delete(doc(db, 'portfolios', uid));
    batch.update(doc(db, 'users', uid), { role: 'client' });
    await batch.commit();

    // Limpeza complementar: falhas aqui não desfazem a exclusão do portfólio
    try {
        await deleteDoc(doc(db, 'professionalLocations', uid));
    } catch (error) {
        console.error('Erro ao excluir localização do profissional:', error);
    }

    try {
        const images = await listAll(ref(storage, `portfolios/${uid}`));
        await Promise.all(images.items.map((item) => deleteObject(item)));
    } catch (error) {
        console.error('Erro ao excluir imagens do portfólio:', error);
    }
}

// Inclui portfólios antigos sem contador, considerando zero curtidas.
export function subscribeToTopProfessionals(
    onUpdate: (professionals: Professional[]) => void,
    onError: (error: Error) => void,
) {
    const activePortfolios = query(
        collection(db, 'portfolios'),
        where('isActive', '==', true),
    );

    return onSnapshot(activePortfolios, (snapshot) => {
        const professionals = snapshot.docs.map((document): Professional => {
            const data = document.data() as PortfolioData;
            return {
                id: document.id,
                name: data.displayName,
                city: data.city,
                avatarUrl: data.photoUri ?? '',
                hasCnpj: data.hasCnpj,
                likesCount: Math.max(0, data.likesCount ?? 0),
            };
        });

        const mostLiked = professionals.filter((professional) => (professional.likesCount ?? 0) > 0);
        mostLiked.sort((a, b) =>
            (b.likesCount ?? 0) - (a.likesCount ?? 0) || a.id.localeCompare(b.id)
        );
        onUpdate(mostLiked.slice(0, 10));
    }, onError);
}

// Mesmos campos obrigatórios da validação do formulário profissional.
export function isPortfolioComplete(data: Partial<PortfolioData>): boolean {
    const requiredFields = [
        data.photoUri, data.mainProfessionId, data.displayName,
        data.experienceRange, data.zipCode, data.street, data.neighborhood,
        data.city, data.aboutMe,
    ];
    return requiredFields.every((value) => typeof value === 'string' && value.trim().length > 0)
        && (!data.hasCnpj || (typeof data.cnpj === 'string' && data.cnpj.trim().length > 0));
}

export function subscribeToCompleteProfessionals(
    onUpdate: (professionals: CompleteProfessional[]) => void,
    onError: (error: Error) => void,
) {
    return onSnapshot(query(collection(db, 'portfolios'), where('isActive', '==', true)), (snapshot) => {
        const professionals: CompleteProfessional[] = [];
        snapshot.docs.forEach((document) => {
            const data = document.data() as PortfolioData;
            if (!isPortfolioComplete(data)) return;
            professionals.push({
                id: document.id,
                name: data.displayName,
                city: data.city,
                avatarUrl: data.photoUri!,
                hasCnpj: data.hasCnpj,
                mainProfessionId: data.mainProfessionId!,
                secondaryProfessionIds: data.secondaryProfessionIds ?? [],
                aboutMe: data.aboutMe,
                likesCount: Math.max(0, data.likesCount ?? 0),
            });
        });
        professionals.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
        onUpdate(professionals);
    }, onError);
}
