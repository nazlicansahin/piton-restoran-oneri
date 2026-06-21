export type PriceTier = "budget" | "mid" | "premium";

export interface Place {
  id: string; // OSM id, e.g. "node/12345"
  name: string | null;
  cuisine: string | null;
  address: string | null;
  lat: number;
  lng: number;
  category: "restaurant" | "cafe" | "fast_food";
  distanceKm: number;
}

export interface PlacesResponse {
  items: Place[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}
