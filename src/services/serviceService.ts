import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/firebaseConfig";

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

async function uploadPhoto(uri: string, path: string): Promise<string> {
    const blob = await (await fetch(uri)).blob();
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob);
    return getDownloadURL(fileRef);
}

export async function createService(input: ServiceInput): Promise<string> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");

    const photoUrls = await Promise.all(
        input.photos.map((uri, i) =>
            uploadPhoto(uri, `services/${uid}/${Date.now()}-${i}.jpg`),
        ),
    );

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

    return docRef.id;
}