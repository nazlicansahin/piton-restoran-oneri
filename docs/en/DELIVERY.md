# Delivery expectations (PITON PDF)

Maps **§4 Delivery Expectations** from **PTN-RestoranOneri-V.1.0** to this repository.

| | |
|---|---|
| **Source PDF** | `PTN-RestoranOneri-V.1.0-260612.pdf` — Section 4 |
| **Submit to** | hr@piton.com.tr |
| **Public repo** | [github.com/nazlicansahin/piton-restoran-oneri](https://github.com/nazlicansahin/piton-restoran-oneri) |
| **Live demo** | [piton-restoran-oneri.vercel.app](https://piton-restoran-oneri.vercel.app) |

---

## 4.1 GitHub repository

| Expectation | Status | Evidence |
|-------------|--------|----------|
| Public, accessible source repo | ✅ | [nazlicansahin/piton-restoran-oneri](https://github.com/nazlicansahin/piton-restoran-oneri) |

---

## 4.2 README.md (required sections)

The PDF requires four sections in the root `README.md`. Details live under `docs/en/`; the root README summarizes and links.

| PDF item | Description | Documentation | Status |
|----------|-------------|---------------|--------|
| **Setup** | Local install, env step-by-step | [README.md](./README.md) · [Root README](../../README.md#kurulum-kılavuzu) | ✅ |
| **File structure** | Folders + module purpose | [STRUCTURE.md](./STRUCTURE.md) | ✅ |
| **Usage** | Technical rationale + flow | [USAGE.md](./USAGE.md) | ✅ |
| **Screenshots** | Annotated main screens | [screenshots/README.md](./screenshots/README.md) · [Root README](../../README.md#ekran-görüntüleri) | ✅ |

---

## 4.3 Video recording

| Expectation | Status | Notes |
|-------------|--------|-------|
| Short video: setup, usage scenario, key technical choices | ⏳ | Not uploaded yet |

Suggested flow (3–5 min): clone/dev server or live URL → location/search → preferences → sign-in/favorites → brief stack overview → optional dark mode, i18n, AI chat.

Upload to YouTube (unlisted) or Drive and email the link with the repo URL to **hr@piton.com.tr**.

---

## 4.4 Submission

| Step | Status |
|------|--------|
| Public repo | ✅ |
| Link + video to hr@piton.com.tr | ⏳ Video pending |

---

## Scope coverage (PDF §1)

| Scope item | Coverage | Notes |
|------------|----------|-------|
| Location + map marker | ✅ | Geolocation, Leaflet, search center |
| Live data (name, cuisine, address) | ✅ | Overpass + Nominatim proxy |
| Preferences (cuisine, distance, **price**) | ⚠️ Partial | Cuisine + distance ✅; price omitted — see [USAGE.md](./USAGE.md) |
| Recommendation algorithm | ✅ | `lib/recommend.ts`, **Match: N%** |
| Local persistence (LocalStorage / SQLite) | ⚠️ Alternative | Firebase + Neon Postgres — see [USAGE.md](./USAGE.md) |

---

## Bonus (PDF §3)

| Bonus | Status |
|-------|--------|
| Dark / light theme | ✅ |
| AI chatbot | ✅ |
| Production deploy | ✅ |
| i18n | ✅ TR / EN |
| CI/CD (lint, test, build) | ⚠️ Partial | Actions: lint + build + Docker; tests local — see [USAGE.md](./USAGE.md#cicd) |

Türkçe: [docs/tr/DELIVERY.md](../tr/DELIVERY.md)
