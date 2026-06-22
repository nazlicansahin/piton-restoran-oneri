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

export interface FavoriteDto {
  placeId: string;
  name: string | null;
  cuisine: string | null;
  address: string | null;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface PreferencesDto {
  maxDistanceKm: number;
  pricePreference: PriceTier | null;
  cuisines: string[];
  updatedAt: string | null;
}

export type GroupRole = "owner" | "admin" | "member";

export interface GroupListItemDto {
  id: string;
  name: string;
  description: string | null;
  role: GroupRole;
  memberCount: number;
  createdAt: string;
}

export interface GroupMemberDto {
  userId: string;
  displayName: string | null;
  email: string | null;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupDetailsDto {
  id: string;
  name: string;
  description: string | null;
  role: GroupRole;
  members: GroupMemberDto[];
  createdAt: string;
}

export interface GroupFavoriteDto {
  placeId: string;
  name: string | null;
  cuisine: string | null;
  address: string | null;
  lat: number;
  lng: number;
  note: string | null;
  addedByName: string | null;
  createdAt: string;
}

export interface GroupInviteDto {
  id: string;
  email: string | null;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface RecommendationItem {
  placeId: string;
  totalScore: number;
  scoreBreakdown: {
    distance: number;
    cuisine: number;
    price: number;
    history: number;
  };
  reasons: string[];
}
