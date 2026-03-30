//Essas são as importações que eu preciso fazer para que a minha função de esrever algo no banco  de dados e no authentication funcionem

import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth"; //import da função que cria um novo usuário
import { doc, setDoc } from "firebase/firestore"; //doc importa a referência do documento "users"; setDoc realmente grava no banco

//Aqui eu estou basicamente dizendo que qualquer objeto do tipo signUpData precisa necessariamente ter esses campos com esse tipos dentro dele

interface SignUpData {
  fullName: string;
  CPF: string;
  phoneNumber: string;
  birthday: string;
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    //o auth automaticamente cria um ID único para cada usuário, aqui eu estou "pegando" esse Id
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      fullName: data.fullName,
      CPF: data.CPF,
      phone: data.phoneNumber,
      birthday: data.birthday,
      email: data.email,
      createdAt: new Date().toISOString(),
    });

    alert("Usuário cadastrado com sucesso!");
  } catch (error) {
    alert(`Erro ao cadastrar:" ${error}`);
    throw error;
  }
}
