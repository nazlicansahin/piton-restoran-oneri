# Recommendation functions

> Implement `lib/recommend.ts` and document each exported function below.

### `rankPlaces` (planned)

- **File:** `lib/recommend.ts`
- **Purpose:** Rank nearby venues for "Senin İçin En Uygun Mekanlar" using user preferences and favorite signals.
- **How it works:**
  1. Hard-filter places beyond `maxDistanceKm`
  2. Score each candidate: `0.35×distance + 0.35×cuisine + 0.15×price + 0.15×history`
  3. Sort by total score descending; tie-break by distance, then name
- **Inputs:** `RecommendationInput` — `places`, `preferences`, `favoriteSignals`
- **Returns:** `RecommendationItem[]` with `scoreBreakdown` and `reasons`
- **Side effects:** None (pure function)
- **Dependencies:** `lib/cuisine.ts` for cuisine matching
- **Example:**
  ```ts
  const items = rankPlaces({ places, preferences, favoriteSignals });
  ```

---

_Add new functions in this file as they are implemented._
