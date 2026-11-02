import type { ServiceDocument } from "../services/serviceService";

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
