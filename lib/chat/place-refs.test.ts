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
    photoUrl: null,
    wikipediaTag: null,
  },
];

describe("place-refs", () => {
  it("extracts unique ids in order", () => {
    const text = "Try [node/42] or [node/42] and [way/99]";
    expect(extractPlaceIds(text)).toEqual(["node/42", "way/99"]);
  });

  it("strips id markers from display text", () => {
    expect(stripPlaceIdMarkers("Visit [node/42] nearby.")).toBe("Visit nearby.");
  });

  it("resolves places from context", () => {
    const resolved = resolvePlacesFromText("See [node/42]", places);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.name).toBe("Test Cafe");
  });
});
