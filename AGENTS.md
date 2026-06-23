# Agent Guide — piton-restoran-oneri

PITON Technology take-home: smart restaurant recommendation + map web app.

## Stack

- Next.js 14+ (App Router, TypeScript)
- shadcn/ui + Tailwind
- Zustand (UI cache + optimistic updates)
- Firebase Auth (Google + email/password; no anonymous auth)
- Neon Postgres (favorites, groups, preferences)
- Leaflet + react-leaflet
- Overpass API (venues) via `/api/places`
- REST only — no GraphQL
- Docker for app runtime only (not Firebase/Postgres hosting)

## Architecture

Modular monolith with directional deps:

`UI → hooks/store → API client → route handlers → services → DB`

Domains: `auth`, `places`, `recommendation`, `favorites`, `groups`

## State rules

- Server (Postgres) = source of truth for favorites/groups/preferences
- Zustand = UI state + optimistic cache; rollback on API failure
- Recommendation engine = pure function in `lib/recommend.ts` (no network/DB)

## Auth

- Sign-in via Google or email/password only — anonymous auth is disabled
- Map + nearby places browsing is public; favorites/groups/preferences require login
- Client sends `Authorization: Bearer <firebaseIdToken>`
- Server verifies token via `firebase-admin`, maps `firebase_uid → users.id`
- Never trust `user_id` from client body/query

## Build order

1. Auth verify + DB + error envelope
2. `GET /api/places`
3. Favorites CRUD
4. Groups CRUD + group favorites
5. Preferences + recommendation tie-in
6. Tests + hardening

## Scope guardrails

- Do not dockerize Firebase
- Do not add GraphQL
- Do not store all OSM venues — only interacted place snapshots
- Do not enable anonymous auth
- Keep changes minimal and focused

## Function documentation

When creating or changing functions, document them in `docs/en/functions/<domain>.md` and `docs/tr/functions/<domain>.md` per [docs/en/FUNCTION_DOCUMENTATION.md](docs/en/FUNCTION_DOCUMENTATION.md). Rule: `.cursor/rules/function-documentation.mdc`.

## Deliverables (assignment)

- Public GitHub repo, README (setup + architecture + algorithm), screenshots, demo video
