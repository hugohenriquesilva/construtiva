import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verificarMaioridade } from '../src/utils/AgeValidator';

const HOJE = new Date('2026-07-26');

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(HOJE);
});

afterEach(() => {
    vi.useRealTimers();
});

describe('verificarMaioridade', () => {
    it('retorna true para quem já fez 18 anos', () => {
        expect(verificarMaioridade('1990-05-15')).toBe(true);
    });

    it('retorna false para menor de idade', () => {
        expect(verificarMaioridade('2015-05-15')).toBe(false);
    });

    it('retorna true no dia exato em que completa 18 anos', () => {
        // 18 anos antes de "hoje", exatamente
        expect(verificarMaioridade('2008-07-26')).toBe(true);
    });

    it('retorna false um dia antes de completar 18 anos', () => {
        expect(verificarMaioridade('2008-07-27')).toBe(false);
    });

    it('retorna true um dia depois de completar 18 anos', () => {
        expect(verificarMaioridade('2008-07-25')).toBe(true);
    });

    it('lida corretamente com aniversário em mês diferente do atual', () => {

        expect(verificarMaioridade('2008-01-10')).toBe(true);

        expect(verificarMaioridade('2008-12-10')).toBe(false);
    });
});