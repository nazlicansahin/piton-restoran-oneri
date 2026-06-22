import type { Place } from "./types";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

/** Filters places by name (case-insensitive, Turkish-aware). */
export function filterPlacesByName(places: Place[], query: string): Place[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return places;

  return places.filter((place) => {
    const name = normalize(place.name ?? "");
    if (!name) return false;
    return terms.every((term) => name.includes(term));
  });
}
