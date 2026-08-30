const GEOCODE_TO_GEOHASH_URL =
  'https://us-central1-construtiva-c292f.cloudfunctions.net/geocodeToGeohash';

// Busca o geohash de uma coordenada usando a Cloud Function geocodeToGeohash
export async function fetchGeohash(latitude: number, longitude: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  try {
    const response = await fetch(`${GEOCODE_TO_GEOHASH_URL}?${params.toString()}`);
    const data = await response.json();

    return data.geohash || null;
  } catch (error) {
    console.error('Erro ao buscar geohash:', error);
    return null;
  }
}
