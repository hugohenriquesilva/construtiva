import { describe, expect, it } from "vitest";

import { filterServices, rankServicesByDistance } from "../src/utils/filterServices";
import type { ServiceDocument } from "../src/services/serviceService";

function service(
  id: string,
  professionId: string,
  areas: string[],
  status = "open",
  deadline: Date | null = null,
  ownerUid = "client-1",
): ServiceDocument {
  return {
    id,
    ownerUid,
    title: id,
    professionId,
    areas,
    description: "",
    location: "",
    photos: [],
    status,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    deadline,
  };
}

describe("filterServices", () => {
  const items = [
    service("main", "painter", ["Pintura"]),
    service("secondary", "electrician", ["Elétrica"]),
    service("other", "plumber", ["Hidráulica"]),
    service("closed", "painter", ["Pintura"], "closed"),
    service("expired", "painter", ["Pintura"], "open", new Date("2020-01-01")),
  ];

  it("shows only open services for the main and secondary professions by default", () => {
    expect(filterServices(items, ["painter", "electrician"], false).map(({ id }) => id))
      .toEqual(["main", "secondary", "expired"]);
  });

  it("refines automatic results by the selected category without removing the portfolio filter", () => {
    expect(filterServices(items, ["painter", "electrician"], false, {
      type: "profession",
      id: "electrician",
    }).map(({ id }) => id)).toEqual(["secondary"]);
    expect(filterServices(items, ["painter"], false, {
      type: "area",
      id: "Pintura",
    }).map(({ id }) => id)).toEqual(["main", "expired"]);
  });

  it("shows all open services regardless of profession and keeps expired-deadline services", () => {
    expect(filterServices(items, ["painter"], true).map(({ id }) => id))
      .toEqual(["main", "secondary", "other", "expired"]);
  });

  it("applies a selected profession or area in all-services mode", () => {
    expect(filterServices(items, [], true, {
      type: "area",
      id: "Hidráulica",
    }).map(({ id }) => id)).toEqual(["other"]);
  });

  it("excludes the authenticated owner's services in automatic and all-services modes", () => {
    const items = [
      service("own", "painter", ["Pintura"], "open", null, "professional-1"),
      service("third-party", "painter", ["Pintura"], "open", null, "client-1"),
      service("closed-third-party", "painter", ["Pintura"], "closed", null, "client-2"),
    ];

    expect(filterServices(items, ["painter"], false, null, "professional-1").map(({ id }) => id))
      .toEqual(["third-party"]);
    expect(filterServices(items, [], true, null, "professional-1").map(({ id }) => id))
      .toEqual(["third-party"]);
  });

  it("excludes the owner's service for profession and area searches", () => {
    const items = [
      service("own", "painter", ["Pintura"], "open", null, "professional-1"),
      service("third-party", "painter", ["Pintura"], "open", null, "client-1"),
    ];

    expect(filterServices(items, ["painter"], false, {
      type: "profession",
      id: "painter",
    }, "professional-1").map(({ id }) => id)).toEqual(["third-party"]);
    expect(filterServices(items, ["painter"], false, {
      type: "area",
      id: "Pintura",
    }, "professional-1").map(({ id }) => id)).toEqual(["third-party"]);
  });

  it("does not expose services without an owner as third-party opportunities", () => {
    const itemWithoutOwner = service("unknown-owner", "painter", ["Pintura"]);
    itemWithoutOwner.ownerUid = "";

    expect(filterServices([itemWithoutOwner], ["painter"], true, null, "professional-1"))
      .toEqual([]);
  });
});

describe("rankServicesByDistance", () => {
  // Praça da Sé (SP) como referência; 0,01° de latitude ≈ 1,1 km
  const origin = { latitude: -23.5505, longitude: -46.6333 };
  const at = (id: string, professionId: string, kmNorth: number | null) => ({
    ...service(id, professionId, []),
    coordinates: kmNorth === null
      ? null
      : { latitude: origin.latitude + kmNorth / 111.2, longitude: origin.longitude },
  });
  const items = [
    at("secondary-near", "electrician", 2),
    at("main-far", "painter", 15),
    at("main-near", "painter", 5),
    at("out-of-radius", "painter", 30),
    at("no-location", "painter", null),
    at("other-nearest", "plumber", 1),
  ];

  it("keeps only services inside the radius in personalized mode and drops services without coordinates", () => {
    const personalized = filterServices(items, ["painter", "electrician", "plumber"], false);
    expect(rankServicesByDistance(personalized, origin, 20, false, "painter").map(({ id }) => id))
      .toEqual(["main-near", "main-far", "other-nearest", "secondary-near"]);
  });

  it("shows every service when all services is on, nearest first and without location last", () => {
    const ranked = rankServicesByDistance(items, origin, 20, true);
    expect(ranked.map(({ id }) => id))
      .toEqual(["other-nearest", "secondary-near", "main-near", "main-far", "out-of-radius", "no-location"]);
    expect(ranked.map(({ distanceKm }) => distanceKm === undefined ? undefined : Math.round(distanceKm)))
      .toEqual([1, 2, 5, 15, 30, undefined]);
  });

  it("puts the main profession first in personalized mode, then by distance", () => {
    const personalized = filterServices(items, ["painter", "electrician"], false);
    expect(rankServicesByDistance(personalized, origin, 20, false, "painter").map(({ id }) => id))
      .toEqual(["main-near", "main-far", "secondary-near"]);
  });

  it("returns an empty list when nothing is inside the radius in personalized mode", () => {
    expect(rankServicesByDistance(items, origin, 0.5, false, "painter")).toEqual([]);
  });
});