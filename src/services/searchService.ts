const SEARCH_PROFESSIONAL_URL =
  'https://us-central1-construtiva-c292f.cloudfunctions.net/searchProfessionalByGeoHash';

export interface ProfessionalSearchResult {
  uid: string;
  displayName: string;
  mainProfession: string;
  secondaryProfessions: string[];
  aboutMe: string;
  hasCnpj: boolean;
  photoUri: string | null;
}

export interface SearchProfessionalsResponse {
  results: ProfessionalSearchResult[];
  message?: string;
}

// Busca profissionais próximos por geohash e nome da profissão
export async function searchProfessionalsByGeoHash(
  profession: string,
  geohash: string
): Promise<SearchProfessionalsResponse> {
  const params = new URLSearchParams({ profession, geohash });

  try {
    const response = await fetch(`${SEARCH_PROFESSIONAL_URL}?${params.toString()}`);
    const data = await response.json();

    if (!Array.isArray(data.results)) {
      return { results: [], message: data.error ?? data.message };
    }

    const results: ProfessionalSearchResult[] = data.results.map((item: any) => ({
      uid: item.uid ?? item.id ?? '',
      displayName: item.displayName ?? item.name ?? '',
      mainProfession: item.mainProfession ?? item.profession ?? '',
      secondaryProfessions: item.secondaryProfessions ?? item.occupations ?? [],
      aboutMe: item.aboutMe ?? item.description ?? '',
      hasCnpj: item.hasCnpj ?? false,
      photoUri: item.photoUri ?? null,
    }));

    return { results, message: data.message };
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return { results: [], message: 'Não foi possível buscar profissionais. Tente novamente.' };
  }
}
