"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUserData } from "@/hooks/useUserData";
import { useAppStore } from "@/store/useAppStore";
import { useT, useI18n } from "@/components/providers/I18nProvider";
import { rankPlaces } from "@/lib/recommend";
import type { Place, PlacesResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import { RestaurantChat } from "@/components/chat/RestaurantChat";
import type { ChatContextPayload } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

const MOBILE_PLACES_LIMIT = 12;

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
});

export default function HomePage() {
  const t = useT();
  const { locale } = useI18n();
  const geo = useGeolocation();
  const { favorites, preferences, isFavorite, toggleFavorite } = useUserData();
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const setSelectedPlace = useAppStore((s) => s.setSelectedPlace);

  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileListExpanded, setMobileListExpanded] = useState(false);

  const coords = useMemo(() => {
    if (geo.lat != null && geo.lng != null) return { lat: geo.lat, lng: geo.lng };
    return null;
  }, [geo.lat, geo.lng]);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    async function load() {
      setLoadingPlaces(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/places?lat=${coords!.lat}&lng=${coords!.lng}&radius=2000`,
        );
        if (!res.ok) throw new Error(t("home.placesError"));
        const data = (await res.json()) as PlacesResponse;
        if (!cancelled) setPlaces(data.items);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoadingPlaces(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [coords, t]);

  const placeById = useMemo(
    () => new Map(places.map((p) => [p.id, p])),
    [places],
  );

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => a.distanceKm - b.distanceKm),
    [places],
  );

  const recommendations = useMemo(() => {
    const favoriteList = Object.values(favorites);
    return rankPlaces({
      places,
      preferences: {
        cuisines: preferences.cuisines,
        maxDistanceKm: preferences.maxDistanceKm,
        pricePreference: preferences.pricePreference,
      },
      favoriteSignals: {
        favoritePlaceIds: favoriteList.map((f) => f.placeId),
        favoriteCuisines: favoriteList
          .map((f) => f.cuisine)
          .filter((c): c is string => Boolean(c)),
      },
    }).slice(0, 10);
  }, [places, preferences, favorites]);

  const chatContext = useMemo((): ChatContextPayload => {
    const nearestPlaces = sortedPlaces.slice(0, 50);
    return {
      locale,
      userLocation: coords,
      preferences: {
        cuisines: preferences.cuisines,
        maxDistanceKm: preferences.maxDistanceKm,
        pricePreference: preferences.pricePreference,
      },
      favorites: Object.values(favorites),
      places: nearestPlaces,
      recommendations,
    };
  }, [locale, coords, preferences, favorites, sortedPlaces, recommendations]);

  const hiddenMobileCount = Math.max(
    0,
    sortedPlaces.length - MOBILE_PLACES_LIMIT,
  );

  return (
    <div className="flex h-[calc(100dvh-57px)] flex-col overflow-hidden md:grid md:h-[calc(100vh-57px)] md:grid-cols-[380px_1fr]">
      <section className="relative order-1 h-[42vh] min-h-[260px] shrink-0 bg-muted/20 p-2 md:order-2 md:h-full md:min-h-0 md:p-3">
        <div className="relative h-full overflow-hidden rounded-xl border bg-background shadow-sm ring-1 ring-border/60">
          {coords ? (
            <PlaceMap
              lat={coords.lat}
              lng={coords.lng}
              places={places}
              selectedPlaceId={selectedPlaceId}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("home.waitingLocation")}
            </div>
          )}

          {coords && (
            <RestaurantChat
              context={chatContext}
              onSelectPlace={setSelectedPlace}
            />
          )}
        </div>
      </section>

      <aside className="order-2 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t p-4 md:order-1 md:border-r md:border-t-0">
        <div>
          <h1 className="text-lg font-semibold">{t("home.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {geo.status === "denied"
              ? t("home.locationDenied")
              : geo.status === "loading"
                ? t("home.locating")
                : t("home.placesFound", { count: places.length })}
          </p>
        </div>

        {geo.status === "denied" && (
          <Button variant="outline" size="sm" onClick={geo.request}>
            {t("home.retryLocation")}
          </Button>
        )}

        <PreferenceForm />

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loadingPlaces && (
          <p className="text-sm text-muted-foreground">
            {t("home.loadingPlaces")}
          </p>
        )}

        {recommendations.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">
              {t("home.recommendations")}
            </h2>
            <ul className="flex flex-col gap-2">
              {recommendations.map((rec) => {
                const place = placeById.get(rec.placeId);
                if (!place) return null;
                return (
                  <li key={rec.placeId}>
                    <PlaceCard
                      place={place}
                      recommendation={rec}
                      isFavorite={isFavorite(place.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={setSelectedPlace}
                      selected={selectedPlaceId === place.id}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {sortedPlaces.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">{t("home.allPlaces")}</h2>
            <ul className="flex flex-col gap-2">
              {sortedPlaces.map((p, index) => (
                <li
                  key={p.id}
                  className={cn(
                    index >= MOBILE_PLACES_LIMIT &&
                      !mobileListExpanded &&
                      "hidden md:list-item",
                  )}
                >
                  <PlaceCard
                    place={p}
                    isFavorite={isFavorite(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={setSelectedPlace}
                    selected={selectedPlaceId === p.id}
                  />
                </li>
              ))}
            </ul>
            {hiddenMobileCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full md:hidden"
                onClick={() => setMobileListExpanded((v) => !v)}
              >
                {mobileListExpanded
                  ? t("home.showLess")
                  : t("home.showMore", { count: hiddenMobileCount })}
              </Button>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}
