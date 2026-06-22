import { describe, expect, it } from "vitest";
import { filterPlacesByName } from "./places-search";
import type { Place } from "./types";

const sample: Place[] = [
  {
    id: "node/1",
    name: "Pizza Palace",
    cuisine: "pizza",
    address: null,
    lat: 0,
    lng: 0,
    category: "restaurant",
    distanceKm: 0.5,
  },
  {
    id: "node/2",
    name: "Kebapçı Ahmet",
    cuisine: "kebab",
    address: null,
    lat: 0,
    lng: 0,
    category: "restaurant",
    distanceKm: 1.2,
  },
  {
    id: "node/3",
    name: null,
    cuisine: "cafe",
    address: null,
    lat: 0,
    lng: 0,
    category: "cafe",
    distanceKm: 0.3,
  },
];

describe("filterPlacesByName", () => {
  it("returns all places for empty query", () => {
    expect(filterPlacesByName(sample, "")).toHaveLength(3);
  });

  it("matches place names case-insensitively", () => {
    expect(filterPlacesByName(sample, "pizza")).toHaveLength(1);
    expect(filterPlacesByName(sample, "KEBAP")).toHaveLength(1);
  });

  it("excludes unnamed places when searching", () => {
    expect(filterPlacesByName(sample, "cafe")).toHaveLength(0);
  });

  it("requires all terms to match the name", () => {
    expect(filterPlacesByName(sample, "pizza palace")).toHaveLength(1);
    expect(filterPlacesByName(sample, "pizza kebap")).toHaveLength(0);
  });
});
