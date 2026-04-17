import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");

interface SignUpData {
  fullName: string;
  CPF: string;
  phoneNumber: string;
  birthday: string;
  email: string;
  password: string;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUp(data: SignUpData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      fullName: data.fullName,
      CPF: data.CPF,
      phoneNumber: data.phoneNumber,
      birthday: data.birthday,
      email: data.email,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro no signUp:", error); // só loga, sem alert
    throw error; // repassa pro componente tratar
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("ERRO COMPLETO:", error);
    throw error;
  }
}
