import { describe, it, expect } from 'vitest';
import { cnpjMask } from '../src/utils/CnpjMask';

describe('cnpjMask', () => {
    it('formata um CNPJ completo (00.000.000/0000-00)', () => {
        expect(cnpjMask('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('formata progressivamente enquanto o usuário digita', () => {
        expect(cnpjMask('112223')).toBe('11.222.3');
        expect(cnpjMask('112223330')).toBe('11.222.333/0');
        expect(cnpjMask('1122233300018')).toBe('11.222.333/0001-8');
    });

    it('remove caracteres não numéricos antes de formatar', () => {
        expect(cnpjMask('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });

    it('trunca em 14 dígitos, ignorando o excedente', () => {
        expect(cnpjMask('112223330001819999')).toBe('11.222.333/0001-81');
    });

    it('retorna string vazia para entrada vazia', () => {
        expect(cnpjMask('')).toBe('');
    });
});