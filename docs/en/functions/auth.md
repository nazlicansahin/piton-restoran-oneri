# Auth functions

Authentication uses Firebase (Google + email/password, no anonymous). The
client holds the session; the server verifies ID tokens and maps each user to a
Postgres row.

### `verifyToken`

- **File:** `lib/auth/verify-token.ts`
- **Purpose:** Verify a Firebase ID token from an `Authorization: Bearer <token>` header on protected API routes.
- **How it works:**
  1. Rejects when the header is missing or not a Bearer token
  2. Lazily initializes the Firebase Admin app from `FIREBASE_ADMIN_*` env vars
  3. Calls `admin.auth().verifyIdToken()` and returns the decoded identity
- **Inputs:** `authorizationHeader: string | null`
- **Returns:** `VerifiedUser` — `firebaseUid`, `email`, `name`, `picture`
- **Side effects:** Initializes the Admin SDK singleton on first call
- **Throws:** `missing_bearer_token`, `admin_not_configured`, or Firebase verify errors

### `getOrCreateUser`

- **File:** `lib/auth/get-or-create-user.ts`
- **Purpose:** Map a verified Firebase user to the internal `users` row, creating it on first sight.
- **How it works:** Upserts on `firebase_uid`, refreshing `email`/`display_name`/`photo_url`, and returns the internal id.
- **Inputs:** `VerifiedUser`
- **Returns:** `AppUser` — `id`, `firebaseUid`, `email`, `displayName`
- **Side effects:** Writes to the `users` table
- **Dependencies:** `lib/db.ts` (Neon serverless client)

### `AuthProvider` / `useAuth`

- **File:** `components/providers/AuthProvider.tsx`
- **Purpose:** Client-side auth context exposing the current user and sign-in/out actions.
- **How it works:** Subscribes to `onAuthStateChanged` and memoizes actions (`signInWithGoogle`, `signInWithEmail`, `registerWithEmail`, `signOut`, `getToken`).
- **Returns (`useAuth`):** `{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, signOut, getToken }`
- **Side effects:** Maintains a Firebase auth listener for the app lifetime
