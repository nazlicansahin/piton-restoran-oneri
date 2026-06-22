import { describe, expect, it } from "vitest";
import { filterPlaces } from "./places-search";
import type { Place } from "./types";

const sample: Place[] = [
  {
    id: "node/1",
    name: "Pizza Palace",
    cuisine: "pizza",
    address: "Atatürk Bulvarı",
    lat: 0,
    lng: 0,
    category: "restaurant",
    distanceKm: 0.5,
    photoUrl: null,
    wikipediaTag: null,
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
    photoUrl: null,
    wikipediaTag: null,
  },
];

describe("filterPlaces", () => {
  it("returns all places for empty query", () => {
    expect(filterPlaces(sample, "")).toHaveLength(2);
    expect(filterPlaces(sample, "   ")).toHaveLength(2);
  });

  it("matches name and cuisine case-insensitively", () => {
    expect(filterPlaces(sample, "pizza")).toHaveLength(1);
    expect(filterPlaces(sample, "KEBAP")).toHaveLength(1);
  });

  it("requires all terms to match", () => {
    expect(filterPlaces(sample, "pizza palace")).toHaveLength(1);
    expect(filterPlaces(sample, "pizza kebap")).toHaveLength(0);
  });
});
