"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/components/providers/I18nProvider";
import type { GeocodeResult } from "@/lib/geocode";

interface LocationSearchProps {
  onSelect: (result: GeocodeResult) => void;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2 || loading) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        items?: GeocodeResult[];
        message?: string;
      };

      if (!res.ok) {
        throw new Error(data.message ?? t("home.locationSearchError"));
      }

      const items = data.items ?? [];
      if (items.length === 0) {
        setError(t("home.locationSearchNoResults"));
        return;
      }

      if (items.length === 1) {
        onSelect(items[0]!);
        setQuery("");
        setResults([]);
        return;
      }

      setResults(items);
    } catch (err) {
      setError((err as Error).message || t("home.locationSearchError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSearch} className="relative">
        <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
            setResults([]);
          }}
          placeholder={t("home.locationSearchPlaceholder")}
          aria-label={t("home.locationSearchPlaceholder")}
          className="pl-9 pr-10"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-9"
          disabled={loading || query.trim().length < 2}
          aria-label={t("home.locationSearchSubmit")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {loading && (
        <ul className="flex flex-col gap-1 rounded-md border p-1">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="px-2 py-1.5">
              <Skeleton className="h-3 w-full" />
            </li>
          ))}
        </ul>
      )}

      {!loading && results.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md border p-1">
          {results.map((item) => (
            <li key={`${item.lat}-${item.lng}-${item.label}`}>
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent"
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                  setResults([]);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
