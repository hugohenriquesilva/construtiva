import { describe, expect, it } from "vitest";

import {
  canCloseService,
  canViewServiceDetails,
  filterServicesByStatus,
} from "../src/services/serviceManagementRules";
import type { ServiceDocument } from "../src/services/serviceService";

function service(id: string, status: string): ServiceDocument {
  return {
    id,
    title: id,
    areas: [],
    professionId: "",
    description: "",
    location: "",
    deadline: null,
    photos: [],
    status,
    createdAt: null,
  };
}

describe("service management rules", () => {
  const services = [service("open-service", "open"), service("closed-service", "closed")];

  it("separates the owner's open and closed services", () => {
    expect(filterServicesByStatus(services, "open").map(({ id }) => id))
      .toEqual(["open-service"]);
    expect(filterServicesByStatus(services, "closed").map(({ id }) => id))
      .toEqual(["closed-service"]);
  });

  it("allows closed-service details only to its owner or a professional with their own proposal", () => {
    expect(canViewServiceDetails({
      serviceStatus: "closed",
      isOwner: true,
      hasOwnProposal: false,
    })).toBe(true);
    expect(canViewServiceDetails({
      serviceStatus: "closed",
      isOwner: false,
      hasOwnProposal: true,
    })).toBe(true);
    expect(canViewServiceDetails({
      serviceStatus: "closed",
      isOwner: false,
      hasOwnProposal: false,
    })).toBe(false);
    expect(canViewServiceDetails({
      serviceStatus: "open",
      isOwner: false,
      hasOwnProposal: false,
    })).toBe(true);
    expect(canViewServiceDetails({
      serviceStatus: "closed",
      isOwner: false,
      hasOwnProposal: false,
      isAdmin: true,
    })).toBe(true);
  });


  it("permits closing only an open service belonging to the current user", () => {
    expect(canCloseService({
      currentUserUid: "owner",
      ownerUid: "owner",
      serviceStatus: "open",
    })).toBe(true);
    expect(canCloseService({
      currentUserUid: "other",
      ownerUid: "owner",
      serviceStatus: "open",
    })).toBe(false);
    expect(canCloseService({
      currentUserUid: "owner",
      ownerUid: "owner",
      serviceStatus: "closed",
    })).toBe(false);
  });
});
