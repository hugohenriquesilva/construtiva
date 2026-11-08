import type { Coordinates } from "../services/locationService";
import type { ServiceDocument } from "../services/serviceService";
import { distanceKm, hasValidCoordinates } from "./proximity";

export type ServiceCategoryFilter =
  | { type: "profession"; id: string }
  | { type: "area"; id: string };

export function filterServices(
  services: ServiceDocument[],
  professionIds: string[],
  showAll: boolean,
  category?: ServiceCategoryFilter | null,
  currentUserUid?: string,
): ServiceDocument[] {
  return services.filter((service) => {
    if (service.status !== "open") return false;
    if (!service.ownerUid || service.ownerUid === currentUserUid) return false;
    if (!showAll && !professionIds.includes(service.professionId)) return false;
    if (!category) return true;
    return category.type === "profession"
      ? service.professionId === category.id
      : service.areas.includes(category.id);
  });
}

export type ServiceWithDistance = ServiceDocument & { distanceKm?: number };

export function rankServicesByDistance(
  services: ServiceDocument[],
  origin: Coordinates,
  radiusKm: number,
  showAll: boolean,
  mainProfessionId?: string | null,
): ServiceWithDistance[] {
  const relevance = (service: ServiceDocument) =>
    !showAll && service.professionId !== mainProfessionId ? 1 : 0;

  return services
    .map((service): ServiceWithDistance => ({
      ...service,
      distanceKm: hasValidCoordinates(service.coordinates)
        ? distanceKm(origin, service.coordinates)
        : undefined,
    }))
    .filter((service) => showAll
      || (service.distanceKm !== undefined && service.distanceKm <= radiusKm))
    .sort((a, b) =>
      relevance(a) - relevance(b)
      || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      || a.id.localeCompare(b.id));
}