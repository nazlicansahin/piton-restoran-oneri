"use client";

import { Coffee, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import type { Place } from "@/lib/types";

interface PlacePopupPhotoProps {
  place: Place;
}

export function PlacePopupPhoto({ place }: PlacePopupPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(place.photoUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setPhotoUrl(place.photoUrl);
    setFailed(false);
  }, [place.id, place.photoUrl]);

  useEffect(() => {
    if (photoUrl || !place.wikipediaTag) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/places/photo?wikipedia=${encodeURIComponent(place.wikipediaTag!)}`,
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { url: string | null };
        if (!cancelled && data.url) setPhotoUrl(data.url);
      } catch {
        // Placeholder remains when no photo is available.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [place.wikipediaTag, photoUrl]);

  const PlaceholderIcon =
    place.category === "cafe" ? Coffee : UtensilsCrossed;
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <div className="relative mb-2 -mx-1 -mt-1 h-28 overflow-hidden rounded-md bg-muted">
      {!showPhoto && (
        <div className="flex h-full items-center justify-center text-muted-foreground/70">
          <PlaceholderIcon className="h-6 w-6" aria-hidden />
        </div>
      )}
      {photoUrl && !failed && (
        // External OSM/Wikimedia URLs vary per venue; native img fits Leaflet popups.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
