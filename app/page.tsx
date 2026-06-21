"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUserData } from "@/hooks/useUserData";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/components/providers/I18nProvider";
import { rankPlaces } from "@/lib/recommend";
import type { Place, PlacesResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PreferenceForm } from "@/components/preferences/PreferenceForm";

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
});

export default function HomePage() {
  const t = useT();
  const geo = useGeolocation();
  const { favorites, preferences, isFavorite, toggleFavorite } = useUserData();
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const setSelectedPlace = useAppStore((s) => s.setSelectedPlace);

  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [coords]);

  const placeById = useMemo(
    () => new Map(places.map((p) => [p.id, p])),
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

  return (
    <div className="grid h-[calc(100vh-57px)] grid-cols-1 md:grid-cols-[380px_1fr]">
      <aside className="flex flex-col gap-4 overflow-y-auto border-r p-4">
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

        {places.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold">{t("home.allPlaces")}</h2>
            <ul className="flex flex-col gap-2">
              {places.map((p) => (
                <li key={p.id}>
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
          </section>
        )}
      </aside>

      <section className="relative">
        {coords ? (
          <PlaceMap
            lat={coords.lat}
            lng={coords.lng}
            places={places}
            selectedPlaceId={selectedPlaceId}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("home.waitingLocation")}
          </div>
        )}
      </section>
    </div>
  );
}
