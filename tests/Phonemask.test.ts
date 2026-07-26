import { describe, it, expect } from 'vitest';
import { PhoneMask } from '../src/utils/PhoneMask';

describe('PhoneMask', () => {
    it('formata um celular de 11 dígitos: (00) 00000-0000', () => {
        expect(PhoneMask('11987654321')).toBe('(11) 98765-4321');
    });

    it('formata um telefone fixo de 10 dígitos (comportamento atual, não ideal)', () => {
        expect(PhoneMask('1133334444')).toBe('(11) 33334-444');
    });

    it('formata progressivamente enquanto o usuário digita', () => {
        expect(PhoneMask('11')).toBe('11');
        expect(PhoneMask('119')).toBe('(11) 9');
    });

    it('remove caracteres não numéricos antes de formatar', () => {
        expect(PhoneMask('(11) 98765-4321')).toBe('(11) 98765-4321');
    });

    it('retorna string vazia para entrada vazia', () => {
        expect(PhoneMask('')).toBe('');
    });
});