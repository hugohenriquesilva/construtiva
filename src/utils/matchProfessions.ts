import { Profession, professionDuplicateKey } from '@/src/services/professionService';

export interface ProfessionMatch {
  profession: Profession;
  // Trecho do nome que combinou com o texto digitado (usado para destacar em negrito)
  matchStart: number;
  matchLength: number;
}

// Início de cada palavra do nome (posição 0 e logo após espaço, hífen ou barra)
function wordStarts(key: string): number[] {
  const starts = [0];
  for (let i = 1; i < key.length; i++) {
    if (/[\s\-/]/.test(key[i - 1])) starts.push(i);
  }
  return starts;
}

// Sugestões para o texto digitado, ignorando maiúsculas e acentos.
// Ordem: nomes que começam com o texto, depois nomes em que alguma palavra começa com ele.
export function matchProfessions(query: string, professions: Profession[]): ProfessionMatch[] {
  const queryKey = professionDuplicateKey(query);
  if (!queryKey) return [];

  const byName: ProfessionMatch[] = [];
  const byWord: ProfessionMatch[] = [];

  professions.forEach((profession) => {
    const nameKey = professionDuplicateKey(profession.name);
    const start = wordStarts(nameKey).find((i) => nameKey.startsWith(queryKey, i));
    if (start === undefined) return;

    const match = { profession, matchStart: start, matchLength: queryKey.length };
    (start === 0 ? byName : byWord).push(match);
  });

  const alphabetical = (a: ProfessionMatch, b: ProfessionMatch) =>
    a.profession.name.localeCompare(b.profession.name, 'pt-BR');

  return [...byName.sort(alphabetical), ...byWord.sort(alphabetical)];
}
