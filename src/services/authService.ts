import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  User,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

  if (!result.user.emailVerified) {
    await auth.signOut();
    throw new Error("email-not-verified");
  }

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
    await sendEmailVerification(userCredential.user);

    await setDoc(doc(db, "users", uid), {
      fullName: data.fullName,
      CPF: data.CPF,
      phoneNumber: data.phoneNumber,
      birthday: data.birthday,
      email: data.email,
      createdAt: new Date().toISOString(),
      location: false,
    });
  } catch (error) {
    console.log(error);
    throw error; // repassa pro componente tratar
  }
}

// Cria o documento em "users" no primeiro login (login social não passa pelo signUp)
async function ensureUserProfile(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return;

  await setDoc(userRef, {
    fullName: user.displayName ?? "",
    CPF: "",
    phoneNumber: user.phoneNumber ?? "",
    birthday: "",
    email: user.email ?? "",
    createdAt: new Date().toISOString(),
    location: false,
  });
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Login com Google via popup (funciona apenas na Web)
export async function loginWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error("ERRO COMPLETO:", error);
    throw error;
  }
}

// Login com Google via id_token (fluxo nativo, iOS/Android, obtido pelo expo-auth-session)
export async function loginWithGoogleIdToken(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserProfile(result.user);
  return result.user;
}
