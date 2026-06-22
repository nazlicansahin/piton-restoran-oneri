"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { api } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import type { FavoriteDto, Place, PreferencesDto } from "@/lib/types";

/**
 * Loads and mutates the authenticated user's favorites and preferences.
 * Favorites use optimistic updates with rollback on failure.
 */
export function useUserData() {
  const { user, getToken } = useAuth();
  const t = useT();
  const favorites = useAppStore((s) => s.favorites);
  const preferences = useAppStore((s) => s.preferences);
  const setFavorites = useAppStore((s) => s.setFavorites);
  const addFavorite = useAppStore((s) => s.addFavorite);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const setPreferences = useAppStore((s) => s.setPreferences);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [favs, prefs] = await Promise.all([
          api.getFavorites(token),
          api.getPreferences(token),
        ]);
        if (cancelled) return;
        setFavorites(favs.items);
        setPreferences(prefs.item);
      } catch {
        // Non-fatal: user can still browse the public map.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, getToken, setFavorites, setPreferences]);

  const isFavorite = useCallback(
    (placeId: string) => Boolean(favorites[placeId]),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (place: Place) => {
      if (!user) {
        toast.error(t("fav.loginRequired"));
        return;
      }
      const token = await getToken();
      if (!token) return;

      const wasFavorite = Boolean(favorites[place.id]);
      const snapshot = favorites[place.id];

      // Optimistic update
      if (wasFavorite) {
        removeFavorite(place.id);
      } else {
        const optimistic: FavoriteDto = {
          placeId: place.id,
          name: place.name,
          cuisine: place.cuisine,
          address: place.address,
          city: null,
          lat: place.lat,
          lng: place.lng,
          createdAt: new Date().toISOString(),
        };
        addFavorite(optimistic);
      }

      try {
        if (wasFavorite) {
          await api.deleteFavorite(token, place.id);
        } else {
          await api.putFavorite(token, place.id, {
            name: place.name,
            cuisine: place.cuisine,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
          });
        }
      } catch {
        // Rollback
        if (wasFavorite && snapshot) {
          addFavorite(snapshot);
        } else {
          removeFavorite(place.id);
        }
        toast.error(t("fav.updateError"));
      }
    },
    [user, getToken, favorites, addFavorite, removeFavorite, t],
  );

  const savePreferences = useCallback(
    async (next: {
      maxDistanceKm: number;
      cuisines: string[];
    }): Promise<boolean> => {
      if (!user) {
        toast.error(t("prefs.loginRequired"));
        return false;
      }
      const token = await getToken();
      if (!token) return false;
      try {
        const res = await api.putPreferences(token, next);
        setPreferences(res.item);
        toast.success(t("prefs.saved"));
        return true;
      } catch {
        toast.error(t("prefs.saveError"));
        return false;
      }
    },
    [user, getToken, setPreferences, t],
  );

  return {
    favorites,
    preferences: preferences as PreferencesDto,
    isFavorite,
    toggleFavorite,
    savePreferences,
  };
}
