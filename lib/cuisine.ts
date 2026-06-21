import type { PriceTier } from "./types";

/**
 * Maps a user-facing cuisine selection to the set of OSM `cuisine` tag values
 * that should count as a related match. Keys are normalized (lowercase).
 */
export const CUISINE_GROUPS: Record<string, string[]> = {
  pizza: ["pizza", "italian"],
  italyan: ["italian", "pizza", "pasta"],
  burger: ["burger", "american"],
  kebap: ["kebab", "turkish", "barbecue"],
  turk: ["turkish", "regional", "anatolian"],
  ev_yemekleri: ["turkish", "regional"],
  kafe: ["cafe", "coffee_shop", "coffee"],
  tatli: ["dessert", "ice_cream", "bakery", "cake"],
  deniz: ["seafood", "fish"],
  uzakdogu: ["chinese", "japanese", "sushi", "asian", "thai", "korean"],
  vejetaryen: ["vegetarian", "vegan"],
  steak: ["steak_house", "barbecue", "grill"],
};

const PREMIUM_CUISINES = new Set([
  "steak_house",
  "sushi",
  "fine_dining",
  "seafood",
  "french",
]);

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[\s-]+/g, "_");
}

/** OSM cuisine tags can be semicolon-separated; split into normalized tokens. */
export function parsePlaceCuisines(cuisine: string | null): string[] {
  if (!cuisine) return [];
  return cuisine
    .split(/[;,]/)
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}

/** Expand selected cuisine keys into the full set of related OSM tag values. */
export function expandSelectedCuisines(selected: string[]): Set<string> {
  const set = new Set<string>();
  for (const sel of selected) {
    const key = normalize(sel);
    set.add(key);
    for (const tag of CUISINE_GROUPS[key] ?? []) {
      set.add(tag);
    }
    // Also allow the raw lowercase selection to match a tag directly.
    set.add(sel.trim().toLowerCase());
  }
  return set;
}

/**
 * Heuristic price tier when OSM data lacks an explicit price tag.
 * Documented as a known limitation in the README.
 */
export function inferPriceTier(
  category: "restaurant" | "cafe" | "fast_food",
  cuisine: string | null,
): PriceTier | null {
  if (category === "fast_food") return "budget";
  const tokens = parsePlaceCuisines(cuisine);
  if (tokens.some((t) => PREMIUM_CUISINES.has(t))) return "premium";
  if (category === "cafe") return "budget";
  return null; // unknown -> neutral price score
}
