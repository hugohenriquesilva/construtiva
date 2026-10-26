// Palavras de ligação que ficam em minúsculas ("Técnico de Refrigeração")
const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

// Exibe "PINTOR RESIDENCIAL" como "Pintor Residencial". O banco continua em MAIÚSCULAS.
export function formatProfessionName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
