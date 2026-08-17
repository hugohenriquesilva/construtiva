import { describe, it, expect } from 'vitest';
import { validarCPF } from '../src/utils/CpfValidator'; // ajuste o caminho se necessário

describe('validarCPF', () => {
    it('aceita um CPF válido, formatado ou não', () => {
        expect(validarCPF('111.444.777-35')).toBe(true);
        expect(validarCPF('11144477735')).toBe(true);
    });

    it('rejeita CPF com todos os dígitos iguais', () => {
        expect(validarCPF('111.111.111-11')).toBe(false);
        expect(validarCPF('000.000.000-00')).toBe(false);
    });

    it('rejeita CPF com tamanho diferente de 11 dígitos', () => {
        expect(validarCPF('123')).toBe(false);
        expect(validarCPF('123456789012')).toBe(false);
    });

    it('rejeita CPF com dígitos verificadores incorretos', () => {
        expect(validarCPF('123.456.789-00')).toBe(false);
    });

    it('rejeita string vazia', () => {
        expect(validarCPF('')).toBe(false);
    });
});