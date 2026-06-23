import { describe, expect, it } from "vitest";
import {
  expandSelectedCuisines,
  formatCuisineDisplay,
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

describe("formatCuisineDisplay", () => {
  it("joins tags with middle dots and replaces underscores", () => {
    expect(formatCuisineDisplay("turkish;kuzu_şiş;ciğer")).toBe(
      "turkish · kuzu şiş · ciğer",
    );
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
