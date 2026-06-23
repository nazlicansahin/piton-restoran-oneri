# File structure and module overview

PDF **§4 README — File structure**: folder layout and short purpose of each module.

| | |
|---|---|
| **Usage flow** | [USAGE.md](./USAGE.md) |
| **Function reference** | [functions/](./functions/README.md) |

---

## Root

| Path | Purpose |
|------|---------|
| `README.md` | Project overview, architecture, setup summary, delivery checklist |
| `package.json` | Scripts: `dev`, `build`, `test`, `db:migrate*` |
| `.env.example` | Environment variable template |
| `Dockerfile` | Multi-stage production image (standalone Next.js) |
| `docker-compose.yml` | Local container run |
| `components.json` | shadcn/ui config |
| `AGENTS.md` | Agent / developer guide |

---

## `app/` — Next.js App Router

| Path | Purpose |
|------|---------|
| `layout.tsx` | Root layout, fonts, theme and provider wrappers |
| `page.tsx` | Home: map, preferences, recommendation/nearby lists, AI chat |
| `globals.css` | Tailwind + theme variables |
| `login/page.tsx` | Email/password and Google sign-in |
| `register/page.tsx` | New account registration |
| `favorites/page.tsx` | Favorites grouped by city |
| `groups/page.tsx` | User’s groups |
| `groups/[groupId]/page.tsx` | Group detail, members, group favorites |

### `app/api/` — REST API (backend)

| Route | Purpose |
|-------|---------|
| `places/route.ts` | Overpass proxy, cache, nearby venues JSON |
| `geocode/route.ts` | Nominatim proxy; city/address search |
| `me/preferences/route.ts` | User preferences GET/PUT |
| `favorites/route.ts` | Favorites GET; add PUT |
| `favorites/[...placeId]/route.ts` | Remove favorite (OSM id contains slash) |
| `groups/route.ts` | List / create groups |
| `groups/[groupId]/route.ts` | Group detail |
| `groups/[groupId]/favorites/` | Group favorites |
| `groups/[groupId]/invites/` | Email invites |
| `chat/route.ts` | AI chat stream (OpenAI / Gateway) |

---

## `components/`

| Folder | Purpose |
|--------|---------|
| `map/` | `RestaurantMap` — Leaflet map, markers, click-to-set center |
| `places/` | `PlaceCard`, pagination; score badge, cuisine expand |
| `preferences/` | `PreferenceForm` — cuisine + distance slider |
| `location/` | Location search (Nominatim) |
| `chat/` | `RestaurantChat` — floating AI panel |
| `layout/` | Header, nav, theme/language toggles |
| `providers/` | `AuthProvider`, `I18nProvider`, `ThemeProvider` |
| `auth/` | `RequireAuth` — protected page wrapper |
| `skeletons/` | Loading skeletons (map, cards, favorites) |
| `ui/` | shadcn/ui primitives |

---

## `hooks/`

| File | Purpose |
|------|---------|
| `useGeolocation.ts` | GPS, permission state, Eskişehir fallback |
| `useUserData.ts` | Load favorites/prefs on auth, toggle, save |

---

## `lib/` — Business logic

| Path | Purpose |
|------|---------|
| `recommend.ts` | Recommendation scoring and ordering |
| `cuisine.ts` | Cuisine matching, OSM tag parsing |
| `overpass.ts` | Overpass query and normalization |
| `places-cache.ts` | 5 min server-side cache |
| `places-distance.ts` | Distance from map search center |
| `haversine.ts` | Great-circle km |
| `db.ts` | Neon serverless SQL client |
| `api-client.ts` | Bearer-token fetch wrapper |
| `http.ts` | Standard API error envelope |
| `groups.ts` | Group membership authorization |
| `favorite-city.ts` | Group favorites by city |
| `place-city.ts` / `upsert-place.ts` | Place snapshot + city field |
| `auth/` | Token verification, user upsert |
| `chat/` | System prompt, model config, validation |
| `i18n/` | TR/EN dictionaries |
| `firebase.ts` | Client Firebase init |
| `types.ts` | Shared TypeScript types |

---

## `store/`

| File | Purpose |
|------|---------|
| `useAppStore.ts` | Zustand: favorite/pref cache, selected place, optimistic UI |

---

## `db/migrations/`

| File | Purpose |
|------|---------|
| `001_initial.sql` | users, preferences, places, favorites, groups |
| `002_phase2.sql` | group_favorites, group_invites |
| `003_places_city.sql` | `places.city` column |

---

## `docs/`

| Path | Purpose |
|------|---------|
| `tr/README.md` | Detailed local setup |
| `tr/USAGE.md` | Usage + technical rationale |
| `tr/STRUCTURE.md` | This file (Turkish) |
| `tr/DELIVERY.md` | PDF delivery mapping |
| `tr/functions/` | Function reference (Turkish) |
| `tr/screenshots/` | Screenshots + captions |
| `en/` | English equivalents |

---

## `.github/workflows/`

| File | Purpose |
|------|---------|
| `ci.yml` | Push/PR: lint, build, Docker build verification |

---

## Dependency direction (summary)

```
UI → hooks/store → lib/api-client → app/api/* → lib/* → Firebase, Neon, Overpass, …
```

Function-level detail: [functions/README.md](./functions/README.md)

Türkçe: [docs/tr/STRUCTURE.md](../tr/STRUCTURE.md)
