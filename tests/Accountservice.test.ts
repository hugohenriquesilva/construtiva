import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as any, signOut: vi.fn().mockResolvedValue(undefined) },
  reauthenticate: vi.fn().mockResolvedValue(undefined),
  credential: vi.fn().mockReturnValue('credential'),
  callable: vi.fn().mockResolvedValue({ data: { deleted: true } }),
}));
vi.mock('@/firebaseConfig', () => ({ auth: mocks.auth, app: {} }));
vi.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: mocks.credential },
  reauthenticateWithCredential: mocks.reauthenticate,
}));
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: () => mocks.callable,
}));
import { deleteCurrentAccount } from '../src/services/accountService';

describe('exclusão da conta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reauthenticate.mockResolvedValue(undefined);
    mocks.callable.mockResolvedValue({ data: { deleted: true } });
    mocks.auth.currentUser = {
      email: 'teste@example.com', providerData: [{ providerId: 'password' }],
      getIdToken: vi.fn().mockResolvedValue('token'),
    };
  });
  it('não envia exclusão sem usuário autenticado', async () => {
    mocks.auth.currentUser = null;
    await expect(deleteCurrentAccount()).rejects.toThrow('Usuário não autenticado');
    expect(mocks.callable).not.toHaveBeenCalled();
  });
  it('não envia exclusão sem senha para conta de e-mail', async () => {
    await expect(deleteCurrentAccount()).rejects.toThrow('Informe sua senha');
    expect(mocks.callable).not.toHaveBeenCalled();
  });
  it('não exclui nem sai quando a senha é rejeitada', async () => {
    mocks.reauthenticate.mockRejectedValueOnce(new Error('senha incorreta'));
    await expect(deleteCurrentAccount('errada')).rejects.toThrow('senha incorreta');
    expect(mocks.callable).not.toHaveBeenCalled();
    expect(mocks.auth.signOut).not.toHaveBeenCalled();
  });
  it('reautentica, renova token, solicita exclusão e encerra sessão', async () => {
    await deleteCurrentAccount('senha');
    expect(mocks.reauthenticate).toHaveBeenCalledWith(mocks.auth.currentUser, 'credential');
    expect(mocks.auth.currentUser.getIdToken).toHaveBeenCalledWith(true);
    expect(mocks.callable).toHaveBeenCalledOnce();
    expect(mocks.auth.signOut).toHaveBeenCalledOnce();
    expect(mocks.auth.currentUser.getIdToken.mock.invocationCallOrder[0]).toBeLessThan(mocks.callable.mock.invocationCallOrder[0]);
  });
  it('mantém sessão se o servidor falhar', async () => {
    mocks.callable.mockRejectedValueOnce(new Error('indisponível'));
    await expect(deleteCurrentAccount('senha')).rejects.toThrow('indisponível');
    expect(mocks.auth.signOut).not.toHaveBeenCalled();
  });
  it('não pede senha para conta Google', async () => {
    mocks.auth.currentUser.providerData = [{ providerId: 'google.com' }];
    await deleteCurrentAccount();
    expect(mocks.reauthenticate).not.toHaveBeenCalled();
    expect(mocks.callable).toHaveBeenCalledOnce();
  });
});
