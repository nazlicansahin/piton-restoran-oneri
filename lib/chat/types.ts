import type { Locale } from "@/lib/i18n/dictionaries";
import type {
  FavoriteDto,
  Place,
  PreferencesDto,
  RecommendationItem,
} from "@/lib/types";

export interface ChatContextPayload {
  locale: Locale;
  userLocation: { lat: number; lng: number } | null;
  preferences: Pick<PreferencesDto, "cuisines" | "maxDistanceKm">;
  favorites: FavoriteDto[];
  places: Place[];
  recommendations: RecommendationItem[];
}
