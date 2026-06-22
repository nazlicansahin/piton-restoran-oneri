"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Heart } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useUserData } from "@/hooks/useUserData";
import { useT } from "@/components/providers/I18nProvider";
import { groupFavoritesByCity } from "@/lib/favorite-city";
import { FavoritesPageSkeleton } from "@/components/skeletons/FavoritesPageSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FavoriteDto, Place } from "@/lib/types";

function FavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: FavoriteDto;
  onRemove: (place: Place) => void;
}) {
  const t = useT();

  return (
    <Card className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium">{favorite.name ?? t("place.unnamed")}</p>
        <p className="text-xs text-muted-foreground">
          {favorite.cuisine ?? t("place.noCuisine")}
        </p>
        {favorite.address && (
          <p className="mt-1 text-xs text-muted-foreground">
            {favorite.address}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onRemove({
            id: favorite.placeId,
            name: favorite.name,
            cuisine: favorite.cuisine,
            address: favorite.address,
            lat: favorite.lat,
            lng: favorite.lng,
            category: "restaurant",
            distanceKm: 0,
          })
        }
      >
        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
      </Button>
    </Card>
  );
}

function FavoritesContent() {
  const t = useT();
  const { favorites, toggleFavorite, userDataLoading } = useUserData();
  const items = useMemo(
    () =>
      Object.values(favorites).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [favorites],
  );
  const unknownCityLabel = t("fav.unknownCity");
  const cityGroups = useMemo(
    () => groupFavoritesByCity(items, unknownCityLabel),
    [items, unknownCityLabel],
  );

  if (userDataLoading) {
    return <FavoritesPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">{t("fav.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("fav.count", { count: items.length })}
      </p>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("fav.empty")}{" "}
          <Link href="/" className="underline">
            {t("fav.discover")}
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {cityGroups.map((group) => (
            <section key={group.city}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">{group.city}</h2>
                <span className="text-xs text-muted-foreground">
                  {t("fav.cityCount", { count: group.items.length })}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {group.items.map((favorite) => (
                  <li key={favorite.placeId}>
                    <FavoriteCard
                      favorite={favorite}
                      onRemove={toggleFavorite}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
