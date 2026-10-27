import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from '@/firebaseConfig';

export async function deleteCurrentAccount(password?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado.');

  if (user.providerData.some((provider) => provider.providerId === 'password')) {
    if (!user.email || !password) throw new Error('Informe sua senha atual.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  }

  // Atualiza o token após a reautenticação para enviar auth_time ao servidor.
  await user.getIdToken(true);
  const deleteAccount = httpsCallable(getFunctions(app, 'us-central1'), 'deleteAccount');
  await deleteAccount();
  await auth.signOut();
}
