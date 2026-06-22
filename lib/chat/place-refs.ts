import type { Place } from "../types";

const PLACE_ID_PATTERN = /\[(node|way|relation)\/\d+\]/gi;

/** Extracts unique OSM place ids from assistant text, in order of appearance. */
export function extractPlaceIds(text: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const pattern = /\[(node|way|relation)\/\d+\]/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const id = match[0].slice(1, -1);
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

/** Removes bracketed place ids from displayed assistant text. */
export function stripPlaceIdMarkers(text: string): string {
  return text
    .replace(PLACE_ID_PATTERN, "")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function resolvePlacesFromText(
  text: string,
  places: Place[],
): Place[] {
  const byId = new Map(places.map((p) => [p.id, p]));
  return extractPlaceIds(text)
    .map((id) => byId.get(id))
    .filter((p): p is Place => Boolean(p));
}
