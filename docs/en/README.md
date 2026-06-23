# Local setup guide (English)

Step-by-step instructions for running this project **on your own machine**.

| | |
|---|---|
| **Project overview** | [Root README](../../README.md) |
| **Function reference** | [docs/en/functions/](./functions/README.md) |
| **Türkçe kurulum** | [docs/tr/README.md](../tr/README.md) |

---

## What this guide covers

Everything needed for the map, venue lists, preferences, favorites, and groups: **external services** (Firebase, Neon) and **environment variables**. AI chat is optional. No account is required for Overpass or Nominatim.

---

## 1. Software on your machine

| Software | Minimum | Check | Required |
|----------|---------|-------|----------|
| **Git** | 2.x | `git --version` | Yes |
| **Node.js** | 20 LTS | `node --version` | Yes |
| **npm** | 10+ (bundled with Node) | `npm --version` | Yes |
| **psql** (PostgreSQL client) | 14+ | `psql --version` | Yes for migrations |
| **Docker Desktop** | — | `docker --version` | No (alternative runtime) |

If Node 20 is missing: [https://nodejs.org](https://nodejs.org) (LTS recommended).

macOS without `psql`:

```bash
brew install libpq
brew link --force libpq
```

On Windows, use the [PostgreSQL installer](https://www.postgresql.org/download/windows/) or WSL.

---

## 2. Accounts to create

| Service | Purpose | Cost | Sign up |
|---------|---------|------|---------|
| **GitHub** | Clone the repo | Free | github.com |
| **Firebase** | Google + email sign-in | Free tier sufficient | console.firebase.google.com |
| **Neon** | Postgres (favorites, prefs, groups) | Free tier | neon.tech |
| **OpenAI** | AI chat (`/api/chat`) | Pay as you go | platform.openai.com |

The map and nearby list work **partially without** Firebase/Neon. Saving favorites, preferences, and groups **require sign-in + database**.

---

## 3. Step-by-step setup

### Step 0 — Clone and install dependencies

```bash
git clone https://github.com/nazlicansahin/piton-restoran-oneri.git
cd piton-restoran-oneri
npm install
```

After success, `node_modules/` exists. If install fails, verify Node version (`node --version` → v20.x).

---

### Step 1 — Neon Postgres

1. [Neon Console](https://console.neon.tech/) → **New Project**
2. Pick a region (e.g. `eu-central-1` for Europe)
3. From **Connection details**, copy **two** connection strings:

| Neon label | `.env.local` variable | When to use |
|------------|----------------------|-------------|
| **Pooled** (`-pooler` host) | `DATABASE_URL` | `npm run dev`, production |
| **Direct** (no pooler) | `DATABASE_URL_UNPOOLED` | Migrations (`npm run db:migrate`) |

> Run migrations on the **direct** URL. Use **pooled** at runtime to avoid connection limits in serverless environments.

---

### Step 2 — Database schema (migrations)

From the project root:

```bash
export DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# 1) Core schema: users, preferences, places, favorites, groups
npm run db:migrate

# 2) Group favorites and invites
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/002_phase2.sql

# 3) places.city (city grouping on favorites)
npm run db:migrate:city
```

Verify:

```bash
psql "$DATABASE_URL_UNPOOLED" -c "\dt"
```

You should see tables such as `users`, `favorites`, `groups`, `places`.

---

### Step 3 — Firebase project

#### 3a. Project and Authentication

1. [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. **Build → Authentication → Get started**
3. On **Sign-in method**, enable:
   - **Google**
   - **Email/Password** (classic email/password, not email link)

#### 3b. Web app (client config)

1. Project Overview → **Web** (`</>`) → app name
2. Map `firebaseConfig` values to `.env.local` `NEXT_PUBLIC_*` fields:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### 3c. Service account (server — protected APIs)

1. **Project settings** (gear) → **Service accounts**
2. **Generate new private key** → download JSON
3. Copy Admin fields into `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** `FIREBASE_ADMIN_PRIVATE_KEY` must be double-quoted with literal `\n` for newlines (as in the JSON file).

#### 3d. Authorized domains (Google sign-in)

Under **Authentication → Settings → Authorized domains**, ensure:

- `localhost`
- (After deploy) your Vercel domain, e.g. `piton-restoran-oneri.vercel.app`

---

### Step 4 — `.env.local`

```bash
cp .env.example .env.local
```

Minimum profile (map + venues + sign-in + favorites):

```env
# Firebase client (Step 3b)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Step 3c)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Neon (Step 1)
DATABASE_URL=postgresql://...-pooler.../...?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...direct.../...?sslmode=require

# Optional — default Overpass endpoint
OVERPASS_URL=https://overpass-api.de/api/interpreter
```

Optional AI chat:

```env
OPENAI_API_KEY=sk-...
# OPENAI_CHAT_MODEL=gpt-4o-mini
```

Never commit `.env.local` to git (it is in `.gitignore`).

---

### Step 5 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Expected on first visit:**

| Feature | Sign-in required | Notes |
|---------|------------------|-------|
| Map + nearby venues | No | Grant location or pick a point on map/search |
| Save preferences | Yes | `/login` or `/register` |
| Favorites | Yes | |
| Groups | Yes | |
| AI chat | No* | *Without `OPENAI_API_KEY`, panel shows “not configured” |

---

### Step 6 — Verify the setup

Try in order:

1. Home page loads, map renders
2. Location permission or city search → venue list appears
3. **Register** → email/password or Google sign-in
4. Select cuisine prefs → **Save preferences** → persists after refresh
5. Heart a venue → appears on **Favorites**
6. (Optional) AI chat responds

Automated checks:

```bash
npm run lint
npm test
npm run build
```

---

## 4. Running with Docker (alternative)

With `.env.local` ready:

```bash
docker compose up --build
```

- App: [http://localhost:3000](http://localhost:3000)
- Firebase and Neon remain **external**; no Postgres container in compose
- Rebuild with `--build` after changing `NEXT_PUBLIC_*` values

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Google sign-in popup error | `localhost` not authorized | Firebase → Authorized domains |
| API 401 / 503 | Admin SDK or token | Check `FIREBASE_ADMIN_*`; sign out and back in |
| API 500 on favorites | DB connection | Pooled `DATABASE_URL`; migrations applied? |
| `psql: command not found` | Client missing | Install `psql` (section 1) |
| Migration error | Wrong URL | `DATABASE_URL_UNPOOLED` must be **direct** |
| Empty venue list | Overpass delay / rate limit | Wait; try another location |
| AI chat 503 | No key | Add `OPENAI_API_KEY` or skip feature |
| `FIREBASE_ADMIN_PRIVATE_KEY` parse error | Bad format | Copy from JSON; double quotes + `\n` |

---

## 6. Setup checklist

- [ ] Node 20+ and `npm install` done
- [ ] Neon project; pooled + direct URLs in `.env.local`
- [ ] All three migrations applied (`001`, `002`, `003`)
- [ ] Firebase Auth: Google + Email/Password enabled
- [ ] `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_ADMIN_*` filled
- [ ] `localhost` in authorized domains
- [ ] `npm run dev` → map and venues work
- [ ] Sign-in → preferences and favorites work
- [ ] (Optional) `OPENAI_API_KEY` → chat works
- [ ] `npm test` and `npm run build` pass

---

## 7. Next steps

- Architecture and algorithm: [../../README.md](../../README.md)
- Function behavior: [functions/](./functions/README.md)
- Production deploy: root README → **Production deployment (Vercel)**
