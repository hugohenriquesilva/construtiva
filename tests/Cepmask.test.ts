import { describe, it, expect } from 'vitest';
import { cepMask } from '../src/utils/CepMask';

describe('cepMask', () => {
    it('formata um CEP completo com o traço na posição certa', () => {
        expect(cepMask('01310100')).toBe('01310-100');
    });

    it('não adiciona traço enquanto o usuário ainda não digitou 6+ dígitos', () => {
        expect(cepMask('013')).toBe('013');
        expect(cepMask('01310')).toBe('01310');
    });

    it('remove caracteres não numéricos antes de formatar', () => {
        expect(cepMask('01310-100')).toBe('01310-100');
        expect(cepMask('abc01310100xyz')).toBe('01310-100');
    });

    it('ignora dígitos além do 8º (trunca o CEP)', () => {
        expect(cepMask('013101001234')).toBe('01310-100');
    });

    it('retorna string vazia para entrada vazia', () => {
        expect(cepMask('')).toBe('');
    });
});