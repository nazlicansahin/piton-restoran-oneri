import { haversineKm } from "@/lib/haversine";
import type { Place } from "@/lib/types";

/** Recompute each place's distance from the active search center. */
export function withDistancesFromCenter(
  places: Place[],
  center: { lat: number; lng: number },
): Place[] {
  return places.map((place) => ({
    ...place,
    distanceKm: Number(
      haversineKm(center.lat, center.lng, place.lat, place.lng).toFixed(3),
    ),
  }));
}
