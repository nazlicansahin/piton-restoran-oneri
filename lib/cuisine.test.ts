import { describe, expect, it } from "vitest";
import {
  expandSelectedCuisines,
  inferPriceTier,
  parsePlaceCuisines,
} from "./cuisine";

describe("parsePlaceCuisines", () => {
  it("splits semicolon/comma separated OSM tags into normalized tokens", () => {
    expect(parsePlaceCuisines("turkish;coffee_shop")).toEqual([
      "turkish",
      "coffee_shop",
    ]);
    expect(parsePlaceCuisines("Pizza, Italian")).toEqual(["pizza", "italian"]);
  });

  it("returns an empty array for missing cuisine", () => {
    expect(parsePlaceCuisines(null)).toEqual([]);
    expect(parsePlaceCuisines("")).toEqual([]);
  });
});

describe("expandSelectedCuisines", () => {
  it("expands a Turkish selection into related OSM tags", () => {
    const set = expandSelectedCuisines(["İtalyan"]);
    expect(set.has("italian")).toBe(true);
    expect(set.has("pizza")).toBe(true);
    expect(set.has("pasta")).toBe(true);
  });

  it("handles the 'Kafe' selection (combining-mark safe)", () => {
    const set = expandSelectedCuisines(["Kafe"]);
    expect(set.has("cafe")).toBe(true);
    expect(set.has("coffee_shop")).toBe(true);
  });

  it("returns an empty set for no selection", () => {
    expect(expandSelectedCuisines([]).size).toBe(0);
  });
});

describe("inferPriceTier", () => {
  it("maps fast_food and cafe to budget", () => {
    expect(inferPriceTier("fast_food", null)).toBe("budget");
    expect(inferPriceTier("cafe", null)).toBe("budget");
  });

  it("maps premium cuisines to premium", () => {
    expect(inferPriceTier("restaurant", "sushi")).toBe("premium");
    expect(inferPriceTier("restaurant", "steak_house")).toBe("premium");
  });

  it("returns null (neutral) for a plain restaurant", () => {
    expect(inferPriceTier("restaurant", "turkish")).toBeNull();
    expect(inferPriceTier("restaurant", null)).toBeNull();
  });
});
