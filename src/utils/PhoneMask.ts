export function PhoneMask(value: string) {
  return value
    .replace(/\D/g, "") // remove tudo que não é número
    .replace(/^(\d{2})(\d)/g, "($1) $2") // (11)
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2") // 99999-9999
    .slice(0, 15);
}
