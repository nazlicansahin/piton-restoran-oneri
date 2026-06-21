"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Place, PlacesResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PlaceMap = dynamic(() => import("@/components/map/PlaceMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Harita yükleniyor...
    </div>
  ),
});

export default function HomePage() {
  const geo = useGeolocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coords = useMemo(() => {
    if (geo.lat != null && geo.lng != null) {
      return { lat: geo.lat, lng: geo.lng };
    }
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
          `/api/places?lat=${coords!.lat}&lng=${coords!.lng}&radius=1500`,
        );
        if (!res.ok) throw new Error("Mekanlar alınamadı");
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

  return (
    <div className="grid h-[calc(100vh-57px)] grid-cols-1 md:grid-cols-[360px_1fr]">
      <aside className="flex flex-col gap-3 overflow-y-auto border-r p-4">
        <div>
          <h1 className="text-lg font-semibold">Yakındaki Mekanlar</h1>
          <p className="text-sm text-muted-foreground">
            {geo.status === "denied"
              ? "Konum izni reddedildi, Eskişehir merkez gösteriliyor."
              : geo.status === "loading"
                ? "Konum alınıyor..."
                : `${places.length} mekan bulundu`}
          </p>
        </div>

        {geo.status === "denied" && (
          <Button variant="outline" size="sm" onClick={geo.request}>
            Konumu tekrar dene
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loadingPlaces && (
          <p className="text-sm text-muted-foreground">Mekanlar yükleniyor...</p>
        )}

        <ul className="flex flex-col gap-2">
          {places.map((p) => (
            <li key={p.id}>
              <Card className="p-3">
                <p className="font-medium">{p.name ?? "İsimsiz mekan"}</p>
                <p className="text-xs text-muted-foreground">
                  {p.cuisine ?? "Mutfak belirtilmemiş"} ·{" "}
                  {p.distanceKm.toFixed(2)} km
                </p>
                {p.address && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.address}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </aside>

      <section className="relative">
        {coords ? (
          <PlaceMap lat={coords.lat} lng={coords.lng} places={places} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Konum bekleniyor...
          </div>
        )}
      </section>
    </div>
  );
}
