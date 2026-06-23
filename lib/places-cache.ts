import { unstable_cache } from "next/cache";
import { fetchNearbyPlaces } from "@/lib/overpass";
import type { Place } from "@/lib/types";

/** How long cached nearby-place responses stay fresh (seconds). */
export const PLACES_CACHE_TTL_SECONDS = 300;

const CACHE_COORD_DECIMALS = 3;
const RADIUS_BUCKET_METERS = 100;

/** Bucket lat/lng/radius so nearby taps and prefs reuse the same cache entry. */
export function normalizePlacesCacheKey(
  lat: number,
  lng: number,
  radiusM: number,
): { lat: number; lng: number; radiusM: number } {
  const factor = 10 ** CACHE_COORD_DECIMALS;

  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
    radiusM: Math.max(
      RADIUS_BUCKET_METERS,
      Math.round(radiusM / RADIUS_BUCKET_METERS) * RADIUS_BUCKET_METERS,
    ),
  };
}

export async function getCachedNearbyPlaces(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<Place[]> {
  const key = normalizePlacesCacheKey(lat, lng, radiusM);

  const readCache = unstable_cache(
    () => fetchNearbyPlaces(key.lat, key.lng, key.radiusM),
    [
      "nearby-places",
      String(key.lat),
      String(key.lng),
      String(key.radiusM),
    ],
    {
      revalidate: PLACES_CACHE_TTL_SECONDS,
      tags: ["places"],
    },
  );

  return readCache();
}

export function placesCacheControlHeader(): string {
  const stale = PLACES_CACHE_TTL_SECONDS * 2;
  return `public, s-maxage=${PLACES_CACHE_TTL_SECONDS}, stale-while-revalidate=${stale}`;
}
