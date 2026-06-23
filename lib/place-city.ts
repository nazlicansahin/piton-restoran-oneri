import { reverseGeocodeCity } from "@/lib/geocode";
import { extractCityFromAddress } from "@/lib/favorite-city";

/** Resolve city once when saving a place (address first, then reverse geocode). */
export async function resolvePlaceCity(
  address: string | null,
  lat: number,
  lng: number,
): Promise<string | null> {
  const fromAddress = extractCityFromAddress(address);
  if (fromAddress) return fromAddress;
  return reverseGeocodeCity(lat, lng);
}

/** Read path: use stored city, fall back to parsing address (no network). */
export function cityFromStoredPlace(
  city: string | null | undefined,
  address: string | null,
): string | null {
  return city?.trim() || extractCityFromAddress(address) || null;
}
