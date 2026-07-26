import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/auth', () => {
    return {
        signInWithEmailAndPassword: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        signInWithPopup: vi.fn(),
        sendEmailVerification: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        GoogleAuthProvider: vi.fn().mockImplementation(function () {
            return { addScope: vi.fn() };
        }),
    };
});

vi.mock('firebase/firestore', () => {
    return {
        doc: vi.fn((_db, collection, id) => ({ collection, id })),
        setDoc: vi.fn(),
    };
});

vi.mock('@/firebaseConfig', () => {
    return {
        auth: { signOut: vi.fn() },
        db: {},
    };
});

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '@/firebaseConfig';
import {
    loginUser,
    signUp,
    resetPassword,
    logoutUser,
    loginWithGoogle,
} from '../src/services/authService';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('loginUser', () => {
    it('retorna o usuário quando o e-mail está verificado', async () => {
        const mockUser = { uid: '123', emailVerified: true };
        (signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

        const result = await loginUser('teste@teste.com', 'senha123');

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'teste@teste.com',
            'senha123',
        );
        expect(result).toBe(mockUser);
    });

    it('desloga e lança erro quando o e-mail não está verificado', async () => {
        const mockUser = { uid: '123', emailVerified: false };
        (signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });
        (auth.signOut as any).mockResolvedValue(undefined);

        await expect(
            loginUser('teste@teste.com', 'senha123'),
        ).rejects.toThrow('email-not-verified');

        expect(auth.signOut).toHaveBeenCalled();
    });

    it('propaga erro do Firebase (ex: senha incorreta)', async () => {
        (signInWithEmailAndPassword as any).mockRejectedValue(
            new Error('auth/wrong-password'),
        );

        await expect(
            loginUser('teste@teste.com', 'senhaErrada'),
        ).rejects.toThrow('auth/wrong-password');
    });
});

describe('signUp', () => {
    const signUpData = {
        fullName: 'Fulano de Tal',
        CPF: '111.444.777-35',
        phoneNumber: '(11) 98765-4321',
        birthday: '1990-01-01',
        email: 'fulano@teste.com',
        password: 'senha123',
    };

    it('cria o usuário no Auth e salva os dados no Firestore', async () => {
        const mockUser = { uid: 'abc123' };
        (createUserWithEmailAndPassword as any).mockResolvedValue({
            user: mockUser,
        });
        (sendEmailVerification as any).mockResolvedValue(undefined);
        (setDoc as any).mockResolvedValue(undefined);

        await signUp(signUpData);

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            signUpData.email,
            signUpData.password,
        );
        expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'abc123');
        expect(setDoc).toHaveBeenCalledTimes(1);

        const savedData = (setDoc as any).mock.calls[0][1];
        expect(savedData).toMatchObject({
            fullName: signUpData.fullName,
            CPF: signUpData.CPF,
            phoneNumber: signUpData.phoneNumber,
            birthday: signUpData.birthday,
            email: signUpData.email,
        });
        expect(typeof savedData.createdAt).toBe('string');
    });

    it('propaga o erro se a criação do usuário falhar (ex: e-mail já em uso)', async () => {
        (createUserWithEmailAndPassword as any).mockRejectedValue(
            new Error('auth/email-already-in-use'),
        );

        await expect(signUp(signUpData)).rejects.toThrow(
            'auth/email-already-in-use',
        );
        expect(setDoc).not.toHaveBeenCalled();
    });

    it('propaga o erro se salvar no Firestore falhar', async () => {
        const mockUser = { uid: 'abc123' };
        (createUserWithEmailAndPassword as any).mockResolvedValue({
            user: mockUser,
        });
        (sendEmailVerification as any).mockResolvedValue(undefined);
        (setDoc as any).mockRejectedValue(new Error('firestore/unavailable'));

        await expect(signUp(signUpData)).rejects.toThrow('firestore/unavailable');
    });
});

describe('resetPassword', () => {
    it('chama sendPasswordResetEmail com o e-mail informado', async () => {
        (sendPasswordResetEmail as any).mockResolvedValue(undefined);

        await resetPassword('teste@teste.com');

        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
            auth,
            'teste@teste.com',
        );
    });
});

describe('logoutUser', () => {
    it('chama signOut do Firebase Auth', async () => {
        (signOut as any).mockResolvedValue(undefined);

        await logoutUser();

        expect(signOut).toHaveBeenCalledWith(auth);
    });
});

describe('loginWithGoogle', () => {
    it('retorna o usuário autenticado via popup do Google', async () => {
        const mockUser = { uid: 'google-123' };
        (signInWithPopup as any).mockResolvedValue({ user: mockUser });

        const result = await loginWithGoogle();

        expect(signInWithPopup).toHaveBeenCalled();
        expect(result).toBe(mockUser);
    });

    it('propaga o erro se o popup falhar ou for fechado pelo usuário', async () => {
        (signInWithPopup as any).mockRejectedValue(
            new Error('auth/popup-closed-by-user'),
        );

        await expect(loginWithGoogle()).rejects.toThrow(
            'auth/popup-closed-by-user',
        );
    });
});