import { describe, expect, it } from "vitest";
import {
  extractPlaceIds,
  resolvePlacesFromText,
  stripPlaceIdMarkers,
} from "./place-refs";
import type { Place } from "../types";

const places: Place[] = [
  {
    id: "node/42",
    name: "Test Cafe",
    cuisine: "coffee",
    address: null,
    lat: 0,
    lng: 0,
    category: "cafe",
    distanceKm: 0.3,
  },
  {
    id: "node/99",
    name: "Pizza House",
    cuisine: "pizza",
    address: null,
    lat: 0,
    lng: 0,
    category: "restaurant",
    distanceKm: 0.8,
  },
];

describe("place-refs", () => {
  it("extracts unique ids in order", () => {
    const text = "Try [node/42], then [node/99], again [node/42]";
    expect(extractPlaceIds(text)).toEqual(["node/42", "node/99"]);
  });

  it("strips id markers from display text", () => {
    expect(stripPlaceIdMarkers("Visit [node/42] nearby.")).toBe("Visit nearby.");
  });

  it("resolves places from context", () => {
    const resolved = resolvePlacesFromText(
      "See [node/42] and [node/99]",
      places,
    );
    expect(resolved.map((p) => p.id)).toEqual(["node/42", "node/99"]);
  });
});
