// Aplica a máscara 00000-000 enquanto o usuário digita
export function cepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}
