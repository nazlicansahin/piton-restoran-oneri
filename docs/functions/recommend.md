# Recommendation engine functions

Pure, deterministic scoring that powers "Senin İçin En Uygun Mekanlar". No
network or DB access lives here, so the same input always yields the same order.

### `rankPlaces`

- **File:** `lib/recommend.ts`
- **Purpose:** Rank nearby venues by a weighted score and produce human-readable reasons.
- **How it works:**
  1. Hard filter: drop places beyond `preferences.maxDistanceKm`
  2. Score each surviving place on four axes:
     - `distance` = `100 * (1 - distanceKm / maxDistanceKm)`
     - `cuisine` = 100 exact match, 30 generic (no cuisine tag), 50 when user picked no cuisine, else 0
     - `price` = 100 match, 50 unknown/neutral, 0 mismatch (tier inferred heuristically)
     - `history` = 100 if already favorited, 70 if it shares a cuisine with a favorite, else 0
  3. Combine with weights `distance .35`, `cuisine .35`, `price .15`, `history .15`
  4. Sort by total desc, then shorter distance, then name (stable tie-break)
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

### `inferPriceTier`

- **File:** `lib/cuisine.ts`
- **Purpose:** Heuristic price tier when OSM lacks a price tag (`fast_food`/`cafe` → budget, premium cuisines → premium, else unknown).
- **Returns:** `PriceTier | null`
- **Side effects:** None (pure)
