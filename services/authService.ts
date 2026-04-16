import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    User
} from "firebase/auth";
import { auth } from "@/firebaseConfig";

// Instanciamos o provider fora para garantir que ele esteja pronto no clique
const googleProvider = new GoogleAuthProvider();
// Adiciona escopos básicos para garantir que o provider não vá vazio
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');


export async function loginUser(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function registerUser(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

export async function loginWithGoogle() {
    try {
        // Instancia EXATAMENTE no momento do clique
        const provider = new GoogleAuthProvider();

        // Use a versão que não depende de parâmetros externos se possível
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error: any) {
        console.error("ERRO COMPLETO:", error);
        throw error;
    }
}

