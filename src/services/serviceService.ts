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
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { uploadServiceImageToStorage } from "./imageStorageService";
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
    };
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