import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeAddress {
  street: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

async function searchNominatim(params: URLSearchParams): Promise<Coordinates | null> {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'User-Agent': 'ConstrutivaApp/1.0',
    },
  });
  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

// Geocodifica um endereço usando a API pública Nominatim (OpenStreetMap).
// Usa busca estruturada (em vez de um texto livre com o bairro) porque o
// bairro devolvido pelo viaCEP nem sempre corresponde ao nome usado pelo
// OpenStreetMap para a mesma rua, o que fazia a busca livre não achar nada.
export async function geocodeAddress(address: GeocodeAddress): Promise<Coordinates | null> {
  try {
    const structuredParams = new URLSearchParams({
      format: 'json',
      limit: '1',
      countrycodes: 'br',
      country: 'Brasil',
      city: address.city,
      postalcode: address.zipCode,
    });
    if (address.street) structuredParams.set('street', address.street);

    const result = await searchNominatim(structuredParams);
    if (result) return result;

    // Fallback: busca só pelo CEP, caso a rua não seja encontrada no OSM.
    const postalCodeParams = new URLSearchParams({
      format: 'json',
      limit: '1',
      countrycodes: 'br',
      country: 'Brasil',
      postalcode: address.zipCode,
    });

    return await searchNominatim(postalCodeParams);
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

// Salva a localização do profissional na coleção "professionalLocations"
export async function saveUserLocation(
  uid: string,
  latitude: number,
  longitude: number,
  geohash: string | null,
  radiusKm: number
): Promise<void> {
  const locationRef = doc(db, 'professionalLocations', uid);

  await setDoc(
    locationRef,
    {
      uid,
      latitude,
      longitude,
      geohash,
      radiusKm,
    },
    { merge: true }
  );
}

export interface ClientLocationData {
  uid: string;
  latitude: number;
  longitude: number;
  geohash: string | null;
  zipCode: string;
}

// Salva a localização do cliente na coleção "clientLocations"
export async function saveClientLocation(
  uid: string,
  latitude: number,
  longitude: number,
  geohash: string | null,
  zipCode: string
): Promise<void> {
  const locationRef = doc(db, 'clientLocations', uid);

  await setDoc(
    locationRef,
    {
      uid,
      latitude,
      longitude,
      geohash,
      zipCode,
    },
    { merge: true }
  );
}

// Busca a localização já salva do cliente na coleção "clientLocations"
export async function getClientLocation(uid: string): Promise<ClientLocationData | null> {
  const snap = await getDoc(doc(db, 'clientLocations', uid));
  if (!snap.exists()) return null;

  return snap.data() as ClientLocationData;
}
