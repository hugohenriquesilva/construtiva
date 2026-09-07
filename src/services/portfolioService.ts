import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    increment,
    writeBatch,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { db, storage, auth } from '@/firebaseConfig';
import { ProfessionalFormData } from '../../types/professionalForm';

export interface PortfolioData {
    displayName: string;
    area: string | null;
    mainProfession: string | null;
    secondaryProfessions: string[];
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

    try {
        const portfolioRef = doc(db, 'portfolios', uid);

        // Upload da foto de perfil se existir e for local (ainda não é uma URL remota)
        let photoUrl: string | null = formData.photoUri;
        if (formData.photoUri && !formData.photoUri.startsWith('http')) {
            photoUrl = await uploadImage(uid, formData.photoUri, 'avatar');
        }

        // Upload das fotos de serviço se existirem
        const servicePhotosUrls: (string | null)[] = await Promise.all(
            formData.servicePhotos.map(async (uri, index) => {
                if (!uri) return null;
                if (!uri.startsWith('http')) {
                    return await uploadImage(uid, uri, `service_${index}`);
                }
                return uri; // já é URL
            })
        );

        const portfolioData: PortfolioData = {
            displayName: formData.displayName,
            area: formData.area,
            mainProfession: formData.mainProfession,
            secondaryProfessions: formData.secondaryProfessions,
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

        await setDoc(portfolioRef, portfolioData, { merge: true });
    } catch (error) {
        console.error('Erro ao salvar portfólio:', error);
        throw error;
    }
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
async function uploadImage(
    uid: string,
    imagePath: string,
    type: string // 'avatar' ou 'service_0', 'service_1', etc
): Promise<string> {
    try {
        // Converter URI para blob
        const response = await fetch(imagePath);
        const blob = await response.blob();

        // Referência no Storage
        const ext = imagePath.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `portfolios/${uid}/${type}.${ext}`);

        // Upload
        const snapshot = await uploadBytes(storageRef, blob);

        // Retornar URL downloadável
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (error) {
        console.error(`Erro ao fazer upload de ${type}:`, error);
        throw error;
    }
}

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
        // Deletar documento
        const portfolioRef = doc(db, 'portfolios', userId);
        await deleteDoc(portfolioRef);

        // Deletar pasta de imagens do Storage (opcional, mas recomendado)
        // Você pode adicionar isso depois se quiser
    } catch (error) {
        console.error('Erro ao deletar portfólio:', error);
        throw error;
    }
}