# Function documentation index

Canonical registry of documented functions. Add a row when you create a new `docs/en/functions/<domain>.md` file (and the matching Turkish file under `docs/tr/functions/`).

| Domain file | Module / area | Status |
|-------------|---------------|--------|
| [recommend.md](./recommend.md) | Recommendation scoring (`lib/recommend.ts`, `lib/cuisine.ts`) | Implemented (Phase 2) |
| [favorites-groups.md](./favorites-groups.md) | Favorites, groups, preferences APIs + client state | Implemented (Phase 2) |
| [chat.md](./chat.md) | AI chat assistant (`lib/chat/*`, `/api/chat`, `RestaurantChat`) | Implemented (Phase 3) |
| [auth.md](./auth.md) | Auth helpers (`lib/auth/*`, `AuthProvider`) | Implemented (Phase 1) |
| [places.md](./places.md) | Places + geo helpers (`lib/overpass.ts`, `lib/places-cache.ts`, `useGeolocation`) | Implemented (Phase 1) |

## Adding a new domain

1. Create `docs/en/functions/<domain>.md` and `docs/tr/functions/<domain>.md`
2. Add a row to both README index files
3. Follow the template in [FUNCTION_DOCUMENTATION.md](../FUNCTION_DOCUMENTATION.md)

---

## Project setup

Step-by-step local setup guide: **[../README.md](../README.md)**  
Türkçe: [../../tr/README.md](../../tr/README.md) · Overview: [../../README.md](../../README.md)
