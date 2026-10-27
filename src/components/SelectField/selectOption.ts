// Opção com valor (ex.: id gravado no banco) separado do texto exibido
export interface SelectOption {
  value: string;
  label: string;
}

// Aceita tanto ['A', 'B'] quanto [{ value, label }]
export function toSelectOptions(options: (string | SelectOption)[]): SelectOption[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}
