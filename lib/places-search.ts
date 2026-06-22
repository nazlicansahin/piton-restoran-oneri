import type { Place } from "./types";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

/** Client-side filter for place name, cuisine, address, and category. */
export function filterPlaces(places: Place[], query: string): Place[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return places;

  return places.filter((place) => {
    const haystack = normalize(
      [place.name, place.cuisine, place.address, place.category]
        .filter(Boolean)
        .join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
