# Recommendation engine functions

Pure, deterministic scoring that powers **Best Picks for You** (`Senin İçin En Uygun Mekanlar`). No network or DB access lives here, so the same input always yields the same order.

### `rankPlaces`

- **File:** `lib/recommend.ts`
- **Purpose:** Rank nearby venues by a weighted score and produce human-readable badge reasons.
- **How it works:**
  1. Hard filter: drop places beyond `preferences.maxDistanceKm`
  2. Score each surviving place on two axes (0–100):
     - `distance` = `100 * (1 - distanceKm / maxDistanceKm)`
     - `cuisine` = 100 exact match, 30 when the place has no cuisine tag, 50 when the user selected no cuisine, else 0
  3. Combine with weights **50% distance + 50% cuisine** → `totalScore` (shown in UI as **Match: N%**)
  4. Compute `history` for badges only (favorited place → 100; shares a cuisine with a favorite → 70; else 0) — **not** added to `totalScore`
  5. Sort by total desc, then shorter distance, then name (stable tie-break)
- **Inputs:** `{ places, preferences, favoriteSignals }`
- **Returns:** `RecommendationItem[]` with `totalScore`, `scoreBreakdown`, and `reasons`
- **Side effects:** None (pure)

### `expandSelectedCuisines`

- **File:** `lib/cuisine.ts`
- **Purpose:** Expand user cuisine choices (e.g. "İtalyan") into the related OSM tag set (`italian`, `pizza`, `pasta`).
- **Returns:** `Set<string>`
- **Side effects:** None (pure)

### `parsePlaceCuisines`

- **File:** `lib/cuisine.ts`
- **Purpose:** Split a semicolon/comma-separated OSM `cuisine` tag into normalized tokens.
- **Returns:** `string[]`
- **Side effects:** None (pure)

### `formatCuisineDisplay`

- **File:** `lib/cuisine.ts`
- **Purpose:** Format OSM cuisine tags for place cards (replace `_` with spaces, join with ` · `).
- **Returns:** `string`
- **Side effects:** None (pure)
