# Favorites, groups & preferences functions

Phase 2 persistence: protected REST routes (Firebase token → internal user) plus
the client hooks and store that drive optimistic UI.

## Server helpers

### `requireUser`

- **File:** `lib/auth/require-user.ts`
- **Purpose:** Resolve the authenticated app user for a protected route, creating the `users` row on first sight.
- **How it works:** Reads the `Authorization` header, verifies the Firebase ID token, then upserts/maps to `users.id`.
- **Returns:** `AppUser`
- **Throws:** `ApiException` 401 (invalid token) / 503 (admin not configured)

### `requireMembership` / `getMembershipRole`

- **File:** `lib/groups.ts`
- **Purpose:** Authorize group access; optionally restrict to `owner`/`admin`.
- **Returns:** the caller's `GroupRole`
- **Throws:** `ApiException` 403 when not a member or lacking the required role.

### `toErrorResponse` / `ApiException` / `makeRequestId`

- **File:** `lib/http.ts`
- **Purpose:** Standard error envelope `{ code, message, details?, requestId }` and a typed error class mapped to HTTP status.
- **Side effects:** Logs unhandled errors with the request ID.

## API routes

- `GET /api/favorites`, `PUT|DELETE /api/favorites/:placeId` — personal favorites (place snapshot upsert + favorite link).
- `GET|PUT /api/me/preferences` — preference profile (distance, price, cuisines).
- `GET|POST /api/groups`, `GET /api/groups/:id` — group list/create (transactional owner membership) and detail with members.
- `GET|POST /api/groups/:id/favorites`, `DELETE /api/groups/:id/favorites/:placeId` — shared group favorites (mutations require owner/admin).
- `POST /api/groups/:id/invites` — email invite with token + 7-day expiry (owner/admin only).

Place IDs contain a slash (`node/123`), so favorite routes use catch-all `[...placeId]` segments.

## Client

### `useUserData`

- **File:** `hooks/useUserData.ts`
- **Purpose:** Load favorites + preferences on auth; expose `toggleFavorite`, `savePreferences`, `isFavorite`.
- **How it works:** Optimistic favorite toggle writes to the Zustand store first, then the API, rolling back + toasting on failure.

### `useAppStore`

- **File:** `store/useAppStore.ts`
- **Purpose:** Zustand cache for favorites (server state), preferences, and UI state (`selectedPlaceId`). Source of truth stays server-side.

### `api`

- **File:** `lib/api-client.ts`
- **Purpose:** Typed fetch wrapper that attaches the bearer token and parses the error envelope into `ApiClientError`.
