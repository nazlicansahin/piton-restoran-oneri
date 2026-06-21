"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/useUserData";
import { useAppStore } from "@/store/useAppStore";
import type { PriceTier } from "@/lib/types";

const CUISINE_OPTIONS = [
  "Pizza",
  "İtalyan",
  "Burger",
  "Kebap",
  "Kafe",
  "Tatlı",
  "Deniz",
  "Uzakdoğu",
  "Vejetaryen",
];

const PRICE_OPTIONS: { value: PriceTier; label: string }[] = [
  { value: "budget", label: "Ekonomik" },
  { value: "mid", label: "Orta" },
  { value: "premium", label: "Lüks" },
];

export function PreferenceForm() {
  const { preferences, savePreferences } = useUserData();
  const setStorePreferences = useAppStore((s) => s.setPreferences);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState(3);
  const [price, setPrice] = useState<PriceTier | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCuisines(preferences.cuisines);
    setMaxDistanceKm(preferences.maxDistanceKm);
    setPrice(preferences.pricePreference);
  }, [preferences]);

  // Apply locally so recommendations react instantly (even before saving).
  useEffect(() => {
    setStorePreferences({
      maxDistanceKm,
      pricePreference: price,
      cuisines,
      updatedAt: preferences.updatedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisines, maxDistanceKm, price]);

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const onSave = async () => {
    setSaving(true);
    await savePreferences({ maxDistanceKm, pricePreference: price, cuisines });
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div>
        <Label className="text-xs uppercase text-muted-foreground">Mutfak</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCuisine(c)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                cuisines.includes(c)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="distance" className="text-xs uppercase text-muted-foreground">
          Maks. mesafe: {maxDistanceKm.toFixed(1)} km
        </Label>
        <input
          id="distance"
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={maxDistanceKm}
          onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
          className="mt-1.5 w-full accent-primary"
        />
      </div>

      <div>
        <Label className="text-xs uppercase text-muted-foreground">Fiyat</Label>
        <div className="mt-1.5 flex gap-1.5">
          {PRICE_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPrice(price === p.value ? null : p.value)}
              className={cn(
                "flex-1 rounded-md border px-2 py-1 text-xs transition-colors",
                price === p.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
      </Button>
    </div>
  );
}
