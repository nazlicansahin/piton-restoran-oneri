import { haversineKm } from "./haversine";
import type { Place } from "./types";

const OVERPASS_URL =
  process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const CATEGORY_BY_AMENITY: Record<string, Place["category"]> = {
  restaurant: "restaurant",
  cafe: "cafe",
  fast_food: "fast_food",
};

export function buildOverpassQuery(
  lat: number,
  lng: number,
  radiusM: number,
): string {
  return `[out:json][timeout:25];
(
  nwr["amenity"="restaurant"](around:${radiusM},${lat},${lng});
  nwr["amenity"="cafe"](around:${radiusM},${lat},${lng});
  nwr["amenity"="fast_food"](around:${radiusM},${lat},${lng});
);
out center;`;
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:neighbourhood"],
    tags["addr:district"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<Place[]> {
  const query = buildOverpassQuery(lat, lng, radiusM);

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "piton-restoran-oneri/1.0 (restaurant recommender)",
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status}`);
  }

  const data = (await res.json()) as OverpassResponse;

  const places: Place[] = [];
  for (const el of data.elements) {
    const tags = el.tags ?? {};
    const amenity = tags.amenity;
    const category = amenity ? CATEGORY_BY_AMENITY[amenity] : undefined;
    if (!category) continue;

    const pLat = el.lat ?? el.center?.lat;
    const pLng = el.lon ?? el.center?.lon;
    if (pLat == null || pLng == null) continue;

    places.push({
      id: `${el.type}/${el.id}`,
      name: tags.name ?? null,
      cuisine: tags.cuisine ?? null,
      address: buildAddress(tags),
      lat: pLat,
      lng: pLng,
      category,
      distanceKm: Number(haversineKm(lat, lng, pLat, pLng).toFixed(3)),
    });
  }

  places.sort((a, b) => a.distanceKm - b.distanceKm);
  return places;
}
