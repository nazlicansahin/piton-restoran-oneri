# Function documentation index

Canonical registry of documented functions. Add a row when you create a new `docs/functions/<domain>.md` file.

| Domain file | Module / area | Status |
|-------------|---------------|--------|
| [recommend.md](./recommend.md) | Recommendation scoring (`lib/recommend.ts`, `lib/cuisine.ts`) | Implemented (Phase 2) |
| [favorites-groups.md](./favorites-groups.md) | Favorites, groups, preferences APIs + client state | Implemented (Phase 2) |
| [auth.md](./auth.md) | Auth helpers (`lib/auth/*`, `AuthProvider`) | Implemented (Phase 1) |
| [places.md](./places.md) | Places + geo helpers (`lib/overpass.ts`, `lib/haversine.ts`, `useGeolocation`) | Implemented (Phase 1) |

## Adding a new domain

1. Create `docs/functions/<domain>.md`
2. Add a row to this table
3. Follow the template in [FUNCTION_DOCUMENTATION.md](../FUNCTION_DOCUMENTATION.md)
