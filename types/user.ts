// "admin" só pode ser atribuído via scripts/admin.js (Admin SDK); o app nunca grava essa role
export type UserRole = 'admin' | 'client' | 'professional';

export const DEFAULT_USER_ROLE: UserRole = 'client';
