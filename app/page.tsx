"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUserData } from "@/hooks/useUserData";
import { useAppStore } from "@/store/useAppStore";
import { useT, useI18n } from "@/components/providers/I18nProvider";
import { rankPlaces } from "@/lib/recommend";
import { filterPlacesByName } from "@/lib/places-search";
import type { Place, PlacesResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";
import { RestaurantChat } from "@/components/chat/RestaurantChat";
import type { ChatContextPayload } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

const MOBILE_PLACES_LIMIT = 12;

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
});

function coordsDiffer(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): boolean {
  return Math.abs(a.lat - b.lat) > 0.00015 || Math.abs(a.lng - b.lng) > 0.00015;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCenter, setSearchCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const userLocation = useMemo(() => {
    if (geo.lat != null && geo.lng != null) {
      return { lat: geo.lat, lng: geo.lng };
    }
    return null;
  }, [geo.lat, geo.lng]);

  useEffect(() => {
    if (searchCenter != null) return;
    if (userLocation) {
      setSearchCenter(userLocation);
    } else if (geo.status !== "loading" && geo.status !== "idle") {
      setSearchCenter(geo.fallback);
    }
  }, [userLocation, geo.status, geo.fallback, searchCenter]);

  const isCustomSearchCenter =
    userLocation != null &&
    searchCenter != null &&
    coordsDiffer(userLocation, searchCenter);

  const handleSearchCenterChange = useCallback(
    (lat: number, lng: number) => {
      setSearchCenter({ lat, lng });
      setSelectedPlace(null);
      setSearchQuery("");
      setMobileListExpanded(false);
    },
    [setSelectedPlace],
  );

  const resetToMyLocation = useCallback(() => {
    if (!userLocation) return;
    handleSearchCenterChange(userLocation.lat, userLocation.lng);
  }, [userLocation, handleSearchCenterChange]);

  useEffect(() => {
    if (!searchCenter) return;
    let cancelled = false;
    async function load() {
      setLoadingPlaces(true);
      setError(null);
      try {
        const radiusM = Math.max(500, Math.round(preferences.maxDistanceKm * 1000));
        const res = await fetch(
          `/api/places?lat=${searchCenter!.lat}&lng=${searchCenter!.lng}&radius=${radiusM}`,
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
  }, [searchCenter, preferences.maxDistanceKm, t]);

  const placeById = useMemo(
    () => new Map(places.map((p) => [p.id, p])),
    [places],
  );

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => a.distanceKm - b.distanceKm),
    [places],
  );

  const filteredPlaces = useMemo(
    () => filterPlacesByName(sortedPlaces, searchQuery),
    [sortedPlaces, searchQuery],
  );

  const isSearching = searchQuery.trim().length > 0;

  const recommendations = useMemo(() => {
    const favoriteList = Object.values(favorites);
    return rankPlaces({
      places,
      preferences: {
        cuisines: preferences.cuisines,
        maxDistanceKm: preferences.maxDistanceKm,
      },
      favoriteSignals: {
        favoritePlaceIds: favoriteList.map((f) => f.placeId),
        favoriteCuisines: favoriteList
          .map((f) => f.cuisine)
          .filter((c): c is string => Boolean(c)),
      },
    }).slice(0, 10);
  }, [places, preferences, favorites]);

  const filteredRecommendations = useMemo(() => {
    if (!isSearching) return recommendations;
    const ids = new Set(filteredPlaces.map((p) => p.id));
    return recommendations.filter((r) => ids.has(r.placeId));
  }, [recommendations, filteredPlaces, isSearching]);

  const chatContext = useMemo((): ChatContextPayload => {
    const nearestPlaces = sortedPlaces.slice(0, 50);
    return {
      locale,
      userLocation: searchCenter,
      preferences: {
        cuisines: preferences.cuisines,
        maxDistanceKm: preferences.maxDistanceKm,
      },
      favorites: Object.values(favorites),
      places: nearestPlaces,
      recommendations,
    };
  }, [locale, searchCenter, preferences, favorites, sortedPlaces, recommendations]);

  const hiddenMobileCount = Math.max(
    0,
    filteredPlaces.length - MOBILE_PLACES_LIMIT,
  );

  const showRecommendations = filteredRecommendations.length > 0;
  const showAllPlaces = filteredPlaces.length > 0;

  const placesSubtitle = (() => {
    if (geo.status === "denied") return t("home.locationDenied");
    if (geo.status === "loading" && !searchCenter) return t("home.locating");
    if (loadingPlaces && places.length === 0) return t("home.loadingPlaces");
    if (isCustomSearchCenter) {
      return t("home.placesNearSelected", { count: places.length });
    }
    return t("home.placesFound", { count: places.length });
  })();

  return (
    <div className="flex h-[calc(100dvh-57px)] flex-col overflow-hidden md:grid md:h-[calc(100vh-57px)] md:grid-cols-[380px_1fr]">
      <section className="relative order-1 h-[42vh] min-h-[260px] shrink-0 bg-muted/20 p-2 md:order-2 md:h-full md:min-h-0 md:p-3">
        <div className="relative h-full overflow-hidden rounded-xl border bg-background shadow-sm ring-1 ring-border/60">
          {searchCenter ? (
            <>
              <PlaceMap
                searchCenter={searchCenter}
                userLocation={userLocation}
                onSearchCenterChange={handleSearchCenterChange}
                places={places}
                selectedPlaceId={selectedPlaceId}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
              <p className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[min(220px,calc(100%-1.5rem))] rounded-md border bg-background/90 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground shadow-sm backdrop-blur-sm">
                {t("map.clickHint")}
              </p>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("home.waitingLocation")}
            </div>
          )}

          {searchCenter && (
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
          <p className="text-sm text-muted-foreground">{placesSubtitle}</p>
        </div>

        {geo.status === "denied" && (
          <Button variant="outline" size="sm" onClick={geo.request}>
            {t("home.retryLocation")}
          </Button>
        )}

        {isCustomSearchCenter && userLocation && (
          <Button variant="outline" size="sm" onClick={resetToMyLocation}>
            {t("home.useMyLocation")}
          </Button>
        )}

        <PreferenceForm />

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loadingPlaces && places.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("home.loadingPlaces")}
          </p>
        )}

        {places.length > 0 && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMobileListExpanded(false);
              }}
              placeholder={t("home.searchPlaceholder")}
              aria-label={t("home.searchPlaceholder")}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-9"
                aria-label={t("home.searchClear")}
                onClick={() => {
                  setSearchQuery("");
                  setMobileListExpanded(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {isSearching && (
          <p className="text-xs text-muted-foreground">
            {filteredPlaces.length > 0
              ? t("home.searchResults", { count: filteredPlaces.length })
              : t("home.searchNoResults")}
          </p>
        )}

        {showRecommendations && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">
              {t("home.recommendations")}
            </h2>
            <ul className="flex flex-col gap-2">
              {filteredRecommendations.map((rec) => {
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

        {showAllPlaces && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">{t("home.allPlaces")}</h2>
            <ul className="flex flex-col gap-2">
              {filteredPlaces.map((p, index) => (
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
