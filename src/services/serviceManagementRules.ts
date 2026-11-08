import type { ServiceDocument } from "./serviceService";

export type ServiceStatusFilter = "open" | "closed";

export function filterServicesByStatus(
  services: ServiceDocument[],
  status: ServiceStatusFilter,
): ServiceDocument[] {
  return services.filter((service) => service.status === status);
}

export function canViewServiceDetails(params: {
  serviceStatus: string;
  isOwner: boolean;
  hasOwnProposal: boolean;
  isAdmin?: boolean;
}): boolean {
  const { serviceStatus, isOwner, hasOwnProposal, isAdmin = false } = params;
  return serviceStatus === "open" || isOwner || hasOwnProposal || isAdmin;
}

export function canCloseService(params: {
  currentUserUid: string | undefined;
  ownerUid: string | undefined;
  serviceStatus: string | undefined;
}): boolean {
  const { currentUserUid, ownerUid, serviceStatus } = params;
  return !!currentUserUid && !!ownerUid && currentUserUid === ownerUid && serviceStatus === "open";
}
