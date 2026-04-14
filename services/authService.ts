import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

import { auth } from "@/firebaseConfig";


export async function loginUser(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function registerUser(email: string, password: string) {
    const result =  await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function logoutUser() {
    await signOut(auth);
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        throw error;
    }
}