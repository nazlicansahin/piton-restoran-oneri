# Dosya yapısı ve modül açıklamaları

PDF **§4 README — Dosya Yapısı**: klasör/dosya yapısı ve her modülün kısa işlevi.

| | |
|---|---|
| **Kullanım akışı** | [USAGE.md](./USAGE.md) |
| **Fonksiyon detayı** | [functions/](./functions/README.md) |

---

## Kök dizin

| Dosya / klasör | İşlev |
|------------------|--------|
| `README.md` | Proje özeti, mimari, kurulum özeti, teslim checklist |
| `package.json` | Script’ler: `dev`, `build`, `test`, `db:migrate*` |
| `.env.example` | Ortam değişkeni şablonu |
| `Dockerfile` | Çok aşamalı production imajı (standalone Next.js) |
| `docker-compose.yml` | Yerel konteyner çalıştırma |
| `components.json` | shadcn/ui yapılandırması |
| `AGENTS.md` | AI agent / geliştirici yönlendirmesi |

---

## `app/` — Next.js App Router

| Yol | İşlev |
|-----|--------|
| `layout.tsx` | Kök layout, font, tema ve provider sarmalayıcıları |
| `page.tsx` | Ana sayfa: harita, tercih paneli, öneri/yakın listeler, AI sohbet |
| `globals.css` | Tailwind + tema değişkenleri |
| `login/page.tsx` | E-posta/şifre ve Google girişi |
| `register/page.tsx` | Yeni hesap kaydı |
| `favorites/page.tsx` | Favoriler; şehre göre gruplu liste |
| `groups/page.tsx` | Kullanıcının grupları |
| `groups/[groupId]/page.tsx` | Grup detayı, üyeler, grup favorileri |

### `app/api/` — REST API (backend)

| Route | İşlev |
|-------|--------|
| `places/route.ts` | Overpass proxy, önbellek, yakın mekan JSON |
| `geocode/route.ts` | Nominatim proxy; şehir/adres arama |
| `me/preferences/route.ts` | Kullanıcı tercihleri GET/PUT |
| `favorites/route.ts` | Favori listesi GET; ekleme PUT |
| `favorites/[...placeId]/route.ts` | Favoriden silme (OSM id slash içerir) |
| `groups/route.ts` | Grup listele / oluştur |
| `groups/[groupId]/route.ts` | Grup detay |
| `groups/[groupId]/favorites/` | Grup favorileri |
| `groups/[groupId]/invites/` | E-posta daveti |
| `chat/route.ts` | AI sohbet stream (OpenAI / Gateway) |

---

## `components/`

| Klasör | İşlev |
|--------|--------|
| `map/` | `RestaurantMap` — Leaflet harita, marker, tıklama ile merkez |
| `places/` | `PlaceCard`, sayfalama; skor rozeti, mutfak genişletme |
| `preferences/` | `PreferenceForm` — mutfak + mesafe kaydırıcı |
| `location/` | Konum arama kutusu (Nominatim) |
| `chat/` | `RestaurantChat` — yüzen AI panel |
| `layout/` | Header, navigasyon, tema/dil anahtarları |
| `providers/` | `AuthProvider`, `I18nProvider`, `ThemeProvider` |
| `auth/` | `RequireAuth` — korumalı sayfa sarmalayıcı |
| `skeletons/` | Yükleme iskeletleri (harita, kart, favoriler) |
| `ui/` | shadcn/ui primitives (Button, Card, Skeleton, …) |

---

## `hooks/`

| Dosya | İşlev |
|-------|--------|
| `useGeolocation.ts` | GPS, izin durumu, Eskişehir fallback |
| `useUserData.ts` | Auth sonrası favori/tercih yükleme, toggle, kaydetme |

---

## `lib/` — İş mantığı

| Dosya / klasör | İşlev |
|----------------|--------|
| `recommend.ts` | Öneri skorlama ve sıralama |
| `cuisine.ts` | Mutfak eşleme, OSM etiket parse |
| `overpass.ts` | Overpass sorgusu ve normalizasyon |
| `places-cache.ts` | Sunucu tarafı 5 dk önbellek |
| `places-distance.ts` | Harita merkezine göre mesafe |
| `haversine.ts` | İki koordinat arası km |
| `db.ts` | Neon serverless SQL client |
| `api-client.ts` | Bearer token’lı fetch sarmalayıcı |
| `http.ts` | Standart API hata zarfı |
| `groups.ts` | Grup üyelik yetkilendirme |
| `favorite-city.ts` | Favorileri şehre göre gruplama |
| `place-city.ts` / `upsert-place.ts` | Mekan snapshot + şehir alanı |
| `auth/` | Token doğrulama, kullanıcı upsert |
| `chat/` | System prompt, model seçimi, validasyon |
| `i18n/` | TR/EN sözlükler |
| `firebase.ts` | İstemci Firebase init |
| `types.ts` | Paylaşılan TypeScript tipleri |

---

## `store/`

| Dosya | İşlev |
|-------|--------|
| `useAppStore.ts` | Zustand: favori/tercih önbelleği, seçili mekan, optimistik UI |

---

## `db/migrations/`

| Dosya | İşlev |
|-------|--------|
| `001_initial.sql` | users, preferences, places, favorites, groups |
| `002_phase2.sql` | group_favorites, group_invites |
| `003_places_city.sql` | `places.city` sütunu |

---

## `docs/`

| Yol | İşlev |
|-----|--------|
| `tr/README.md` | Detaylı yerel kurulum |
| `tr/USAGE.md` | Kullanım + teknik gerekçeler |
| `tr/STRUCTURE.md` | Bu dosya |
| `tr/DELIVERY.md` | PDF teslim beklentileri eşlemesi |
| `tr/functions/` | Fonksiyon referansı (Türkçe) |
| `tr/screenshots/` | Ekran görüntüleri + açıklamalar |
| `en/` | Aynı yapının İngilizce sürümü |

---

## `.github/workflows/`

| Dosya | İşlev |
|-------|--------|
| `ci.yml` | Push/PR: lint, build, Docker build doğrulaması |

---

## Bağımlılık yönü (özet)

```
UI (app/, components/)
  → hooks/, store/
  → lib/api-client.ts
  → app/api/*
  → lib/ (overpass, db, auth, recommend)
  → Harici: Firebase, Neon, Overpass, Nominatim, OpenAI
```

Fonksiyon düzeyinde detay: [functions/README.md](./functions/README.md)
