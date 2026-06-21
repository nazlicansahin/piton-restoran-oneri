# piton-restoran-oneri

Akıllı restoran ve kafe öneri uygulaması. Kullanıcının konumunu algılar,
çevredeki mekanları harita üzerinde gösterir ve tercihlerine göre öneriler
sunar. PITON Technology take-home projesi.

## Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS** + **shadcn/ui**
- **Firebase Auth** — Google ve e-posta/şifre ile giriş (anonim giriş kapalı)
- **Neon Postgres** — favoriler, gruplar, tercihler için kalıcı veri
- **Leaflet** + **react-leaflet** — harita
- **Overpass API** (OpenStreetMap) — mekan verisi, `/api/places` üzerinden proxy
- **Zustand** + **Zod** — istemci durumu ve doğrulama

## Mimari

Backend ayrı bir sunucu değildir: `app/api/*` route handler'ları Vercel
Serverless Functions olarak frontend ile birlikte deploy edilir.

```
Tarayıcı → Next.js sayfaları → app/api/* → (Overpass | Neon | Firebase Admin)
                              ↘ Firebase Auth (istemci tarafı)
```

- Harita ve mekan listeleme **herkese açık** (giriş gerektirmez)
- Favoriler / gruplar / tercihler **giriş gerektirir** (Phase 2)

## Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarlayın — `.env.example` dosyasını kopyalayın:

   ```bash
   cp .env.example .env.local
   ```

   Doldurulması gerekenler:
   - `NEXT_PUBLIC_FIREBASE_*` — Firebase Console > Project settings > Web app
   - `DATABASE_URL` — Neon **pooled** bağlantı dizesi
   - `FIREBASE_ADMIN_*` — korumalı route'lar için servis hesabı (Phase 2)

3. Veritabanı şemasını oluşturun (Neon SQL editor veya psql ile):

   ```bash
   psql "$DATABASE_URL" -f db/migrations/001_initial.sql
   ```

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

   - Harita: <http://localhost:3000>
   - Mekan API: <http://localhost:3000/api/places?lat=39.77&lng=30.52&radius=1500>

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucu |
| `npm run lint` | ESLint |

## Deploy (Vercel)

1. Repoyu Vercel'e import edin (framework: Next.js)
2. `.env.example` içindeki tüm değişkenleri Production + Preview ortamlarına ekleyin
3. Deploy sonrası Vercel domain'ini Firebase **Authorized domains** listesine ekleyin (Google girişi için)

## Yol haritası

- **Phase 1 (tamam):** İskelet, harita + mekanlar, Firebase Auth (Google + e-posta), Neon şeması
- **Phase 2:** Favoriler & gruplar API'ları, öneri motoru UI, tercih paneli, Docker
