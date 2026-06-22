export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** Forward geocode via OpenStreetMap Nominatim (server-side only). */
export async function geocodeQuery(
  query: string,
  limit = 5,
): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: String(limit),
    addressdetails: "0",
    countrycodes: "tr",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "piton-restoran-oneri/1.0 (restaurant recommender)",
    },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = (await res.json()) as NominatimItem[];

  return data
    .map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      label: item.display_name,
    }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}
