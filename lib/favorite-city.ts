import type { FavoriteDto } from "@/lib/types";
import { reverseGeocodeCity } from "@/lib/geocode";

const COUNTRY_PATTERN = /^(türkiye|turkey|tr)$/i;

/** Best-effort city from a stored address string (OSM or Nominatim). */
export function extractCityFromAddress(address: string | null): string | null {
  if (!address?.trim()) return null;

  const trimmed = address.trim();

  if (trimmed.includes(",")) {
    const parts = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !COUNTRY_PATTERN.test(part));

    if (parts.length > 0) {
      return parts[parts.length - 1] ?? null;
    }
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const last = tokens.at(-1);
  if (!last || /^\d+$/.test(last) || last.length < 2) return null;

  return last;
}

function coordCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/** Resolve city from address, falling back to reverse geocoding. */
export async function resolveFavoriteCity(
  favorite: Pick<FavoriteDto, "address" | "lat" | "lng">,
  cache = new Map<string, string | null>(),
): Promise<string | null> {
  const fromAddress = extractCityFromAddress(favorite.address);
  if (fromAddress) return fromAddress;

  const key = coordCacheKey(favorite.lat, favorite.lng);
  if (cache.has(key)) return cache.get(key) ?? null;

  const city = await reverseGeocodeCity(favorite.lat, favorite.lng);
  cache.set(key, city);
  return city;
}

export interface FavoriteCityGroup {
  city: string;
  items: FavoriteDto[];
}

export function groupFavoritesByCity(
  items: FavoriteDto[],
  unknownCityLabel: string,
): FavoriteCityGroup[] {
  const groups = new Map<string, FavoriteDto[]>();

  for (const item of items) {
    const city =
      item.city?.trim() ||
      extractCityFromAddress(item.address) ||
      unknownCityLabel;
    const list = groups.get(city) ?? [];
    list.push(item);
    groups.set(city, list);
  }

  return Array.from(groups.entries())
    .map(([city, cityItems]) => ({
      city,
      items: cityItems.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    }))
    .sort((a, b) => {
      if (a.city === unknownCityLabel) return 1;
      if (b.city === unknownCityLabel) return -1;
      return a.city.localeCompare(b.city, "tr");
    });
}
