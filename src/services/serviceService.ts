import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    query,
    QueryConstraint,
    runTransaction,
    serverTimestamp,
    Timestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { auth, db, storage } from "../../firebaseConfig";
import { uploadServiceImageToStorage } from "./imageStorageService";
import { fetchAddressByCep } from "./cepService";
import { Coordinates, geocodeAddress } from "./locationService";
import { hasValidCoordinates } from "../utils/proximity";
import {
    traceServiceUpload,
    traceServiceUploadFailure,
} from "../utils/serviceUploadTrace";

export type ServiceInput = {
    title: string;
    areas: string[];
    professionId: string;
    description: string;
    cep: string;
    location: string;
    deadline: Date | null;
    photos: string[]; // URIs locais do celular
    aiReview: { verdict: string; originalDescription: string };
};

export type ServiceDate = Date | Timestamp | null;

export type ServiceDocument = {
    id: string;
    ownerUid?: string;
    title: string;
    areas: string[];
    professionId: string;
    description: string;
    location: string;
    deadline: ServiceDate;
    photos: string[];
    status: string;
    createdAt: ServiceDate;
    coordinates?: Coordinates | null;
    ownerName?: string;
    ownerPhotoUri?: string | null;
};

function parseServiceDate(value: unknown): ServiceDate {
    if (value instanceof Date && Number.isFinite(value.getTime())) return value;
    if (value instanceof Timestamp) return value;
    return null;
}

function toServiceDocument(id: string, data: DocumentData): ServiceDocument {
    return {
        id,
        ownerUid: typeof data.ownerUid === "string" ? data.ownerUid : "",
        title: typeof data.title === "string" ? data.title : "",
        areas: Array.isArray(data.areas)
            ? data.areas.filter((area: unknown): area is string => typeof area === "string")
            : [],
        professionId: typeof data.professionId === "string" ? data.professionId : "",
        description: typeof data.description === "string" ? data.description : "",
        location: typeof data.location === "string" ? data.location : "",
        deadline: parseServiceDate(data.deadline),
        photos: Array.isArray(data.photos)
            ? data.photos.filter((photo: unknown): photo is string => typeof photo === "string")
            : [],
        status: typeof data.status === "string" ? data.status : "",
        createdAt: parseServiceDate(data.createdAt),
        coordinates: hasValidCoordinates(data)
            ? { latitude: data.latitude, longitude: data.longitude }
            : null,
        ownerName: typeof data.ownerName === "string" ? data.ownerName : "",
        ownerPhotoUri: typeof data.ownerPhotoUri === "string" ? data.ownerPhotoUri : null,
    };
}


// Nome e foto do perfil do cliente ("Editar perfil"), exibidos em "Cliente solicitante".
// Só esses dois campos vão para o serviço: users/{uid} tem dados pessoais e não é público.
async function getOwnerPublicInfo(uid: string): Promise<{ ownerName: string; ownerPhotoUri: string | null }> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid));
        const data = snapshot.data() ?? {};
        return {
            ownerName: typeof data.fullName === "string" ? data.fullName.trim() : "",
            ownerPhotoUri: typeof data.photoUri === "string" ? data.photoUri : null,
        };
    } catch (error) {
        console.error("Erro ao ler o perfil do cliente:", error);
        return { ownerName: "", ownerPhotoUri: null };
    }
}

export async function syncServiceOwnerInfo(
    ownerUid: string,
    ownerName: string,
    ownerPhotoUri: string | null,
): Promise<void> {
    const snapshot = await getDocs(query(
        collection(db, "services"),
        where("ownerUid", "==", ownerUid),
    ));
    if (snapshot.empty) return;

    // Um lote aceita até 500 operações
    for (let i = 0; i < snapshot.docs.length; i += 450) {
        const batch = writeBatch(db);
        snapshot.docs.slice(i, i + 450).forEach((service) =>
            batch.update(service.ref, { ownerName: ownerName.trim(), ownerPhotoUri }));
        await batch.commit();
    }
}

async function geocodeServiceCep(cep: string): Promise<Coordinates | null> {
    try {
        const address = await fetchAddressByCep(cep);
        if (!address) return null;

        return await geocodeAddress({
            street: address.street,
            neighborhood: address.neighborhood,
            city: address.city,
            zipCode: cep,
        });
    } catch (error) {
        console.error("Erro ao localizar o CEP do serviço:", error);
        return null;
    }
}

function serviceDateMillis(value: ServiceDate): number {
    if (!value) return 0;
    return value instanceof Date ? value.getTime() : value.toMillis();
}

export function serviceDateToDate(value: ServiceDate): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : value.toDate();
}

export async function listOpenServices(professionIds?: string[]): Promise<ServiceDocument[]> {
    const constraints: QueryConstraint[] = [where("status", "==", "open")];
    const uniqueProfessionIds = [...new Set(professionIds ?? [])].filter(Boolean);
    if (uniqueProfessionIds.length > 0) {
        constraints.push(where("professionId", "in", uniqueProfessionIds));
    }

    const snapshot = await getDocs(query(collection(db, "services"), ...constraints));
    return snapshot.docs
        .map((service) => toServiceDocument(service.id, service.data()))
        .sort((a, b) => serviceDateMillis(b.createdAt) - serviceDateMillis(a.createdAt));
}

export async function listServicesByOwner(ownerUid: string): Promise<ServiceDocument[]> {
    if (!ownerUid) {
        throw new Error("Usuário não autenticado.");
    }

    const snapshot = await getDocs(query(
        collection(db, "services"),
        where("ownerUid", "==", ownerUid),
    ));

    return snapshot.docs
        .map((service) => toServiceDocument(service.id, service.data()))
        .sort((a, b) => serviceDateMillis(b.createdAt) - serviceDateMillis(a.createdAt));
}

export async function getServiceById(serviceId: string): Promise<ServiceDocument | null> {
    const snapshot = await getDoc(doc(db, "services", serviceId));
    return snapshot.exists() ? toServiceDocument(snapshot.id, snapshot.data()) : null;
}

export async function closeService(serviceId: string): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        throw new Error("Usuário não autenticado.");
    }

    const serviceRef = doc(db, "services", serviceId);
    await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(serviceRef);
        if (!snapshot.exists()) {
            throw new Error("Este serviço não está mais disponível.");
        }

        const service = snapshot.data();
        if (service.ownerUid !== uid) {
            throw new Error("Você não pode encerrar um serviço publicado por outra pessoa.");
        }
        if (service.status !== "open") {
            throw new Error("Este serviço já foi encerrado.");
        }

        transaction.update(serviceRef, { status: "closed" });
    });
}

// Excluir um serviço denunciado (somente admin, garantido pelas regras do Firestore).
// Remove os lances e o serviço juntos e depois as fotos no Storage.
// As denúncias em "denunciasServicos" são mantidas como histórico.
export async function deleteServiceAsAdmin(serviceId: string): Promise<void> {
    const serviceRef = doc(db, "services", serviceId);
    const [serviceSnap, proposalsSnap] = await Promise.all([
        getDoc(serviceRef),
        getDocs(collection(db, "services", serviceId, "proposals")),
    ]);
    if (!serviceSnap.exists()) return;

    const photos = toServiceDocument(serviceSnap.id, serviceSnap.data()).photos;
    const proposalRefs = proposalsSnap.docs.map((proposal) => proposal.ref);

    // Um lote aceita até 500 operações: os lances que não couberem vão em lotes anteriores
    while (proposalRefs.length > 498) {
        const proposalsBatch = writeBatch(db);
        proposalRefs.splice(0, 450).forEach((proposalRef) => proposalsBatch.delete(proposalRef));
        await proposalsBatch.commit();
    }

    const batch = writeBatch(db);
    proposalRefs.forEach((proposalRef) => batch.delete(proposalRef));
    batch.delete(serviceRef);
    await batch.commit();

    // Limpeza complementar: falhas aqui não desfazem a exclusão do serviço
    const results = await Promise.allSettled(
        photos.map((photoUrl) => deleteObject(ref(storage, photoUrl))),
    );
    results.forEach((result) => {
        if (result.status === "rejected") {
            console.error("Erro ao excluir foto do serviço:", result.reason);
        }
    });
}


export async function createService(input: ServiceInput): Promise<string> {
    traceServiceUpload("createService", "started", {
        photoCount: input.photos.length,
    });
    const uid = auth.currentUser?.uid;
    if (!uid) {
        const error = new Error("Usuário não autenticado");
        traceServiceUploadFailure("createService:authentication", error);
        throw error;
    }

    traceServiceUpload("service-photos", "started", {
        photoCount: input.photos.length,
    });

    const coordinatesPromise = geocodeServiceCep(input.cep);
    const ownerInfoPromise = getOwnerPublicInfo(uid);

    let photoUrls: string[];
    try {
        photoUrls = await Promise.all(
            input.photos.map((uri, i) =>
                uploadServiceImageToStorage(uri, `services/${uid}/${Date.now()}-${i}`),
            ),
        );
    } catch (error) {
        traceServiceUploadFailure("service-photos", error);
        throw error;
    }
    traceServiceUpload("service-photos", "completed", {
        photoCount: photoUrls.length,
    });

    const [coordinates, ownerInfo] = await Promise.all([coordinatesPromise, ownerInfoPromise]);


    traceServiceUpload("firestore-addDoc", "started", {
        photoCount: photoUrls.length,
    });
    try {
        const docRef = await addDoc(collection(db, "services"), {
            ownerUid: uid,
            title: input.title.trim(),
            areas: input.areas,
            professionId: input.professionId,
            description: input.description.trim(),
            cep: input.cep,
            location: input.location,
            deadline: input.deadline,
            photos: photoUrls,
            status: "open",
            aiReview: input.aiReview,
            ...(coordinates ?? {}),
            ...ownerInfo,
            createdAt: serverTimestamp(),
        });

        traceServiceUpload("firestore-addDoc", "completed");
        traceServiceUpload("createService", "completed");
        return docRef.id;
    } catch (error) {
        traceServiceUploadFailure("firestore-addDoc", error);
        throw error;
    }
}