import type { Coordinates } from '../services/locationService';

export function hasValidCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const { latitude, longitude } = value as Coordinates;
  return Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
}

// Distância aproximada em linha reta, em quilômetros (fórmula de Haversine).
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const lat = radians(to.latitude - from.latitude);
  const lon = radians(to.longitude - from.longitude);
  const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(from.latitude))
    * Math.cos(radians(to.latitude)) * Math.sin(lon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function compareByProximity(
  a: { name: string; id: string; distanceKm?: number },
  b: { name: string; id: string; distanceKm?: number },
): number {
  return ((a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id);
}
