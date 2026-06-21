"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useUserData } from "@/hooks/useUserData";
import { useT } from "@/components/providers/I18nProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/types";

function FavoritesContent() {
  const t = useT();
  const { favorites, toggleFavorite } = useUserData();
  const items = Object.values(favorites).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

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
        <ul className="flex flex-col gap-2">
          {items.map((f) => (
            <li key={f.placeId}>
              <Card className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{f.name ?? t("place.unnamed")}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.cuisine ?? t("place.noCuisine")}
                  </p>
                  {f.address && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {f.address}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toggleFavorite({
                      id: f.placeId,
                      name: f.name,
                      cuisine: f.cuisine,
                      address: f.address,
                      lat: f.lat,
                      lng: f.lng,
                      category: "restaurant",
                      distanceKm: 0,
                    } as Place)
                  }
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
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
