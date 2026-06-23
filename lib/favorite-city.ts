import type { FavoriteDto } from "@/lib/types";

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
