import { create } from "zustand";
import type { FavoriteDto, PreferencesDto } from "@/lib/types";

const DEFAULT_PREFERENCES: PreferencesDto = {
  maxDistanceKm: 3,
  cuisines: [],
  updatedAt: null,
};

interface AppState {
  // Server-state cache
  favorites: Record<string, FavoriteDto>;
  preferences: PreferencesDto;
  preferencesLoaded: boolean;

  // UI state
  selectedPlaceId: string | null;

  setFavorites: (items: FavoriteDto[]) => void;
  addFavorite: (fav: FavoriteDto) => void;
  removeFavorite: (placeId: string) => void;
  setPreferences: (prefs: PreferencesDto) => void;
  setSelectedPlace: (placeId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  favorites: {},
  preferences: DEFAULT_PREFERENCES,
  preferencesLoaded: false,
  selectedPlaceId: null,

  setFavorites: (items) =>
    set({
      favorites: Object.fromEntries(items.map((f) => [f.placeId, f])),
    }),
  addFavorite: (fav) =>
    set((s) => ({ favorites: { ...s.favorites, [fav.placeId]: fav } })),
  removeFavorite: (placeId) =>
    set((s) => {
      const next = { ...s.favorites };
      delete next[placeId];
      return { favorites: next };
    }),
  setPreferences: (preferences) => set({ preferences, preferencesLoaded: true }),
  setSelectedPlace: (selectedPlaceId) => set({ selectedPlaceId }),
}));
