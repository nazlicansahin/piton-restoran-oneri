"use client";

import { Heart, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Place, RecommendationItem } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: (place: Place) => void;
  onSelect?: (placeId: string) => void;
  selected?: boolean;
  recommendation?: RecommendationItem;
}

export function PlaceCard({
  place,
  isFavorite,
  onToggleFavorite,
  onSelect,
  selected,
  recommendation,
}: PlaceCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-3 transition-colors hover:bg-accent",
        selected && "ring-2 ring-ring",
      )}
      onClick={() => onSelect?.(place.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{place.name ?? "İsimsiz mekan"}</p>
          <p className="text-xs text-muted-foreground">
            {place.cuisine ?? "Mutfak belirtilmemiş"} · {place.distanceKm.toFixed(2)} km
          </p>
        </div>
        <div className="flex items-center gap-1">
          {recommendation && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {recommendation.totalScore}
            </span>
          )}
          <button
            type="button"
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(place);
            }}
            className="rounded-md p-1 hover:bg-muted"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground",
              )}
            />
          </button>
        </div>
      </div>

      {place.address && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{place.address}</span>
        </p>
      )}

      {recommendation && recommendation.reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {recommendation.reasons.map((r) => (
            <span
              key={r}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
