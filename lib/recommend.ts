import { expandSelectedCuisines, parsePlaceCuisines } from "./cuisine";
import type { Place, RecommendationItem } from "./types";

export interface RecommendationInput {
  places: Place[];
  preferences: {
    cuisines: string[];
    maxDistanceKm: number;
  };
  favoriteSignals: {
    favoritePlaceIds: string[];
    favoriteCuisines: string[];
  };
}

const WEIGHTS = { distance: 0.5, cuisine: 0.5 };

function distanceScore(distanceKm: number, maxDistanceKm: number): number {
  if (maxDistanceKm <= 0) return 0;
  return Math.max(0, Math.min(100, 100 * (1 - distanceKm / maxDistanceKm)));
}

function cuisineScore(
  place: Place,
  selected: Set<string>,
): { score: number; matched: boolean } {
  if (selected.size === 0) return { score: 50, matched: false };

  const tokens = parsePlaceCuisines(place.cuisine);
  if (tokens.length === 0) return { score: 30, matched: false };

  for (const t of tokens) {
    if (selected.has(t)) return { score: 100, matched: true };
  }
  return { score: 0, matched: false };
}

function historyScore(
  place: Place,
  favoritePlaceIds: Set<string>,
  favoriteCuisines: Set<string>,
): number {
  if (favoritePlaceIds.has(place.id)) return 100;
  const tokens = parsePlaceCuisines(place.cuisine);
  if (tokens.some((t) => favoriteCuisines.has(t))) return 70;
  return 0;
}

/**
 * Rank nearby venues for "Senin İçin En Uygun Mekanlar".
 * Pure and deterministic: same input always yields the same ordering.
 */
export function rankPlaces(input: RecommendationInput): RecommendationItem[] {
  const { places, preferences, favoriteSignals } = input;
  const selected = expandSelectedCuisines(preferences.cuisines);
  const favoriteIds = new Set(favoriteSignals.favoritePlaceIds);
  const favoriteCuisines = new Set(
    favoriteSignals.favoriteCuisines.map((c) => c.toLowerCase()),
  );

  const items: RecommendationItem[] = [];

  for (const place of places) {
    if (place.distanceKm > preferences.maxDistanceKm) continue;

    const distance = distanceScore(place.distanceKm, preferences.maxDistanceKm);
    const cuisine = cuisineScore(place, selected);
    const history = historyScore(place, favoriteIds, favoriteCuisines);

    const total =
      WEIGHTS.distance * distance + WEIGHTS.cuisine * cuisine.score;

    const reasons: string[] = [];
    if (distance >= 70) reasons.push("near");
    if (cuisine.matched) reasons.push("cuisineMatch");
    if (history === 100) reasons.push("inFavorites");
    else if (history === 70) reasons.push("similarToFavorites");
    if (reasons.length === 0) reasons.push("popular");

    items.push({
      placeId: place.id,
      totalScore: Math.round(total),
      scoreBreakdown: {
        distance: Math.round(distance),
        cuisine: Math.round(cuisine.score),
        history: Math.round(history),
      },
      reasons,
    });
  }

  const distanceById = new Map(places.map((p) => [p.id, p.distanceKm]));
  const nameById = new Map(places.map((p) => [p.id, p.name ?? ""]));

  items.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const da = distanceById.get(a.placeId) ?? Infinity;
    const db = distanceById.get(b.placeId) ?? Infinity;
    if (da !== db) return da - db;
    return (nameById.get(a.placeId) ?? "").localeCompare(
      nameById.get(b.placeId) ?? "",
    );
  });

  return items;
}
