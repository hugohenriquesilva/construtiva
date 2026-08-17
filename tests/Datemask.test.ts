import { describe, it, expect } from 'vitest';
import { DateMask } from '../src/utils/DateMask';

describe('DateMask', () => {
    it('não insere barra antes de 2 dígitos', () => {
        const result = DateMask('12');
        expect(result.masked).toBe('12');
        expect(result.date).toBeUndefined();
    });

    it('insere a primeira barra após o dia (DD/)', () => {
        const result = DateMask('1225');
        expect(result.masked).toBe('12/25');
        expect(result.date).toBeUndefined();
    });

    it('formata data completa válida e retorna um Date correspondente', () => {
        const result = DateMask('25122024');
        expect(result.masked).toBe('25/12/2024');
        expect(result.date).toBeInstanceOf(Date);
        expect(result.date?.toISOString().slice(0, 10)).toBe('2024-12-25');
    });

    it('mantém a máscara mas retorna date undefined para datas inválidas (ex: mês 99)', () => {
        const result = DateMask('99992024');
        expect(result.masked).toBe('99/99/2024');
        expect(result.date).toBeUndefined();
    });

    it('ignora caracteres não numéricos', () => {
        const result = DateMask('25/12/2024');
        expect(result.masked).toBe('25/12/2024');
        expect(result.date).toBeInstanceOf(Date);
    });

    it('trata entrada vazia sem erros', () => {
        const result = DateMask('');
        expect(result.masked).toBe('');
        expect(result.date).toBeUndefined();
    });
});