import { describe, expect, it } from "vitest";
import { rankPlaces, type RecommendationInput } from "./recommend";
import type { Place } from "./types";

function place(overrides: Partial<Place> & { id: string }): Place {
  return {
    name: overrides.id,
    cuisine: null,
    address: null,
    lat: 39.77,
    lng: 30.52,
    category: "restaurant",
    distanceKm: 1,
    photoUrl: null,
    wikipediaTag: null,
    ...overrides,
  };
}

const baseInput = (places: Place[]): RecommendationInput => ({
  places,
  preferences: { cuisines: [], maxDistanceKm: 3, pricePreference: null },
  favoriteSignals: { favoritePlaceIds: [], favoriteCuisines: [] },
});

describe("rankPlaces - hard filter", () => {
  it("excludes places beyond maxDistanceKm", () => {
    const result = rankPlaces(
      baseInput([
        place({ id: "node/1", distanceKm: 1 }),
        place({ id: "node/2", distanceKm: 5 }),
      ]),
    );
    expect(result.map((r) => r.placeId)).toEqual(["node/1"]);
  });
});

describe("rankPlaces - determinism", () => {
  it("produces identical output for identical input", () => {
    const input = baseInput([
      place({ id: "node/1", distanceKm: 1.2, cuisine: "pizza" }),
      place({ id: "node/2", distanceKm: 0.5, cuisine: "cafe" }),
      place({ id: "node/3", distanceKm: 2.0, cuisine: "turkish" }),
    ]);
    expect(rankPlaces(input)).toEqual(rankPlaces(input));
  });
});

describe("rankPlaces - distance scoring", () => {
  it("ranks the closer place higher when all else is equal", () => {
    const result = rankPlaces(
      baseInput([
        place({ id: "far", distanceKm: 2.5 }),
        place({ id: "near", distanceKm: 0.2 }),
      ]),
    );
    expect(result[0].placeId).toBe("near");
    expect(result[0].scoreBreakdown.distance).toBeGreaterThan(
      result[1].scoreBreakdown.distance,
    );
  });
});

describe("rankPlaces - cuisine match", () => {
  it("scores exact cuisine matches at 100 and adds a reason", () => {
    const input: RecommendationInput = {
      ...baseInput([place({ id: "node/1", cuisine: "pizza", distanceKm: 1 })]),
      preferences: { cuisines: ["Pizza"], maxDistanceKm: 3, pricePreference: null },
    };
    const result = rankPlaces(input);
    expect(result[0].scoreBreakdown.cuisine).toBe(100);
    expect(result[0].reasons).toContain("cuisineMatch");
  });
});

describe("rankPlaces - history", () => {
  it("gives a favorited place full history score and a reason", () => {
    const input: RecommendationInput = {
      ...baseInput([place({ id: "node/9", distanceKm: 1 })]),
      favoriteSignals: { favoritePlaceIds: ["node/9"], favoriteCuisines: [] },
    };
    const result = rankPlaces(input);
    expect(result[0].scoreBreakdown.history).toBe(100);
    expect(result[0].reasons).toContain("inFavorites");
  });
});

describe("rankPlaces - tie-breaks and bounds", () => {
  it("breaks score ties by shorter distance, then alphabetical name", () => {
    // Same cuisine/price/history, only distance differs slightly.
    const result = rankPlaces(
      baseInput([
        place({ id: "node/b", name: "Beta", distanceKm: 1.0 }),
        place({ id: "node/a", name: "Alpha", distanceKm: 1.0 }),
        place({ id: "node/c", name: "Gamma", distanceKm: 0.5 }),
      ]),
    );
    // Closest first
    expect(result[0].placeId).toBe("node/c");
    // Equal-distance pair resolved alphabetically (Alpha before Beta)
    expect(result.slice(1).map((r) => r.placeId)).toEqual(["node/a", "node/b"]);
  });

  it("keeps total scores within 0..100", () => {
    const result = rankPlaces(
      baseInput([place({ id: "node/1", distanceKm: 0.1 })]),
    );
    for (const r of result) {
      expect(r.totalScore).toBeGreaterThanOrEqual(0);
      expect(r.totalScore).toBeLessThanOrEqual(100);
    }
  });
});
