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

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[\s-]+/g, "_");
}

/** Human-readable cuisine line for cards (OSM tags → readable list). */
export function formatCuisineDisplay(cuisine: string | null): string {
  if (!cuisine) return "";
  return parsePlaceCuisines(cuisine)
    .map((tag) => tag.replace(/_/g, " "))
    .join(" · ");
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
    set.add(sel.trim().toLowerCase());
  }
  return set;
}
