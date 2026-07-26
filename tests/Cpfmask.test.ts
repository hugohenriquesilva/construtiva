import { describe, it, expect } from 'vitest';
import { cpfMask } from '../src/utils/CpfMask';

describe('cpfMask', () => {
    it('formata um CPF completo (000.000.000-00)', () => {
        expect(cpfMask('12345678909')).toBe('123.456.789-09');
    });

    it('formata progressivamente enquanto o usuário digita', () => {
        expect(cpfMask('123')).toBe('123');
        expect(cpfMask('123456')).toBe('123.456');
    });

    it('remove caracteres não numéricos antes de formatar', () => {
        expect(cpfMask('123.456.789-09')).toBe('123.456.789-09');
    });

    it('trunca a string formatada em 14 caracteres quando há excesso de dígitos', () => {
        expect(cpfMask('123456789091234')).toBe('123.456.789091');
    });

    it('retorna string vazia para entrada vazia', () => {
        expect(cpfMask('')).toBe('');
    });
});