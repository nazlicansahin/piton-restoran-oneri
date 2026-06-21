"use client";

import { useState } from "react";
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
  const [saving, setSaving] = useState(false);

  // The Zustand store is the single source of truth so recommendations react
  // instantly. Each handler patches the store; Save persists to the server.
  const patch = (changes: Partial<typeof preferences>) =>
    setStorePreferences({ ...preferences, ...changes });

  const toggleCuisine = (c: string) =>
    patch({
      cuisines: preferences.cuisines.includes(c)
        ? preferences.cuisines.filter((x) => x !== c)
        : [...preferences.cuisines, c],
    });

  const onSave = async () => {
    setSaving(true);
    await savePreferences({
      maxDistanceKm: preferences.maxDistanceKm,
      pricePreference: preferences.pricePreference,
      cuisines: preferences.cuisines,
    });
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
                preferences.cuisines.includes(c)
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
          Maks. mesafe: {preferences.maxDistanceKm.toFixed(1)} km
        </Label>
        <input
          id="distance"
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={preferences.maxDistanceKm}
          onChange={(e) => patch({ maxDistanceKm: Number(e.target.value) })}
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
              onClick={() =>
                patch({
                  pricePreference:
                    preferences.pricePreference === p.value ? null : p.value,
                })
              }
              className={cn(
                "flex-1 rounded-md border px-2 py-1 text-xs transition-colors",
                preferences.pricePreference === p.value
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
