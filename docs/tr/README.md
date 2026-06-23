# Yerel kurulum rehberi (Türkçe)

Projeyi **kendi bilgisayarınızda** çalıştırmak isteyen geliştiriciler için adım adım kurulum kılavuzu.

| | |
|---|---|
| **Proje genel bakış** | [Kök README](../../README.md) |
| **Dosya yapısı** | [STRUCTURE.md](./STRUCTURE.md) |
| **Kullanım ve teknik tercihler** | [USAGE.md](./USAGE.md) |
| **Teslim beklentileri (PDF §4)** | [DELIVERY.md](./DELIVERY.md) |
| **Açıklamalı görseller** | [screenshots/README.md](./screenshots/README.md) |
| **Fonksiyon referansı** | [functions/](./functions/README.md) |
| **English setup** | [docs/en/README.md](../en/README.md) |

---

## Bu rehberde neler var?

Harita, mekan listesi, tercihler, favoriler ve grupların çalışması için gereken **tüm harici servisler** (Firebase, Neon) ve **ortam değişkenleri** bu dokümanda adım adım anlatılır. AI sohbet opsiyoneldir; Overpass ve Nominatim için hesap açmanız gerekmez.

---

## 1. Bilgisayarınızda olması gerekenler

| Yazılım | Minimum | Kontrol | Zorunlu |
|---------|---------|---------|---------|
| **Git** | 2.x | `git --version` | Evet |
| **Node.js** | 20 LTS | `node --version` | Evet |
| **npm** | 10+ (Node ile gelir) | `npm --version` | Evet |
| **psql** (PostgreSQL client) | 14+ | `psql --version` | Migration için evet |
| **Docker Desktop** | — | `docker --version` | Hayır (alternatif çalıştırma) |

Node 20 kurulu değilse: [https://nodejs.org](https://nodejs.org) (LTS önerilir).

macOS’ta `psql` yoksa:

```bash
brew install libpq
brew link --force libpq
```

Windows’ta [PostgreSQL installer](https://www.postgresql.org/download/windows/) veya WSL içinde `psql` kullanılabilir.

---

## 2. Oluşturmanız gereken hesaplar

| Servis | Ne için | Ücret | Kayıt |
|--------|---------|-------|-------|
| **GitHub** | Repoyu klonlamak | Ücretsiz | github.com |
| **Firebase** | Google + e-posta girişi | Ücretsiz kotası yeterli | console.firebase.google.com |
| **Neon** | Postgres (favoriler, tercihler, gruplar) | Ücretsiz tier | neon.tech |
| **OpenAI** | AI sohbet (`/api/chat`) | Kullandıkça öde | platform.openai.com |

Harita ve yakın mekan listesi **Firebase/Neon olmadan** kısmen çalışır; favori kaydetme, tercihler ve gruplar **giriş + veritabanı** gerektirir.

---

## 3. Adım adım kurulum

### Adım 0 — Repoyu indirin ve bağımlılıkları kurun

```bash
git clone https://github.com/nazlicansahin/piton-restoran-oneri.git
cd piton-restoran-oneri
npm install
```

Başarılı kurulum sonrası `node_modules/` oluşur. Hata alırsanız Node sürümünü kontrol edin (`node --version` → v20.x).

---

### Adım 1 — Neon Postgres

1. [Neon Console](https://console.neon.tech/) → **New Project**
2. Bölge seçin (Avrupa yakınlığı için `eu-central-1` uygun)
3. **Connection details** ekranından **iki** bağlantı dizesini not edin:

| Neon’daki ad | `.env.local` değişkeni | Ne zaman kullanılır |
|--------------|------------------------|---------------------|
| **Pooled** ( `-pooler` host) | `DATABASE_URL` | `npm run dev`, production |
| **Direct** (pooler yok) | `DATABASE_URL_UNPOOLED` | Migration (`npm run db:migrate`) |

> Migration’ları **direct** bağlantı ile çalıştırın. Runtime’da **pooled** kullanın; aksi halde serverless ortamda bağlantı limiti sorunları yaşanabilir.

---

### Adım 2 — Veritabanı şeması (migration)

Terminalde proje klasöründeyken:

```bash
export DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# 1) Temel şema: users, preferences, places, favorites, groups
npm run db:migrate

# 2) Grup favorileri ve davetler
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/002_phase2.sql

# 3) places.city (favorilerde şehir gruplama)
npm run db:migrate:city
```

Doğrulama:

```bash
psql "$DATABASE_URL_UNPOOLED" -c "\dt"
```

`users`, `favorites`, `groups`, `places` gibi tablolar listelenmelidir.

---

### Adım 3 — Firebase projesi

#### 3a. Proje ve Authentication

1. [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. **Build → Authentication → Get started**
3. **Sign-in method** sekmesinde etkinleştirin:
   - **Google**
   - **Email/Password** (Email link değil, klasik e-posta/şifre)

#### 3b. Web uygulaması (istemci config)

1. Project Overview → **Web** (`</>`) ikonu → uygulama adı girin
2. Firebase SDK snippet ekranındaki `firebaseConfig` değerlerini `.env.local` içindeki `NEXT_PUBLIC_*` alanlarına yazın:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### 3c. Service account (sunucu — korumalı API’ler)

1. **Project settings** (dişli) → **Service accounts**
2. **Generate new private key** → JSON indir
3. JSON içinden Admin alanlarını `.env.local`’a aktarın:

```env
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Önemli:** `FIREBASE_ADMIN_PRIVATE_KEY` çift tırnak içinde olmalı; satır sonları `\n` olarak yazılmalı (JSON’daki gibi). Tek satırda `\n` karakterleri koruyun.

#### 3d. Authorized domains (Google girişi için)

**Authentication → Settings → Authorized domains** listesinde şunlar olmalı:

- `localhost`
- (Production deploy sonrası) Vercel domain’iniz, örn. `piton-restoran-oneri.vercel.app`

---

### Adım 4 — `.env.local` dosyası

```bash
cp .env.example .env.local
```

Minimum çalışan profil (harita + mekanlar + giriş + favoriler):

```env
# Firebase client (Adım 3b)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Adım 3c)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Neon (Adım 1)
DATABASE_URL=postgresql://...-pooler.../...?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...direct.../...?sslmode=require

# Opsiyonel — varsayılan Overpass endpoint
OVERPASS_URL=https://overpass-api.de/api/interpreter
```

Opsiyonel AI sohbet:

```env
OPENAI_API_KEY=sk-...
# OPENAI_CHAT_MODEL=gpt-4o-mini
```

`.env.local` dosyasını **asla** git’e commit etmeyin (`.gitignore` içindedir).

---

### Adım 5 — Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

**İlk açılışta beklenen davranış:**

| Özellik | Giriş gerekli mi | Not |
|---------|------------------|-----|
| Harita + yakın mekanlar | Hayır | Konum izni veya haritada/aramada nokta seçin |
| Tercih kaydetme | Evet | `/login` veya `/register` |
| Favoriler | Evet | |
| Gruplar | Evet | |
| AI sohbet | Hayır* | *`OPENAI_API_KEY` yoksa panel “yapılandırılmamış” der |

---

### Adım 6 — Kurulumu doğrulayın

Sırayla deneyin:

1. Ana sayfa açılıyor, harita yükleniyor
2. Konum izni veya şehir araması → sol panelde mekan listesi geliyor
3. **Kayıt ol** → e-posta/şifre veya Google ile giriş
4. Mutfak tercihi seç → **Tercihleri Kaydet** → sayfa yenilense bile kalıyor
5. Bir mekana kalp → **Favoriler** sayfasında görünüyor
6. (Opsiyonel) AI sohbet paneli yanıt veriyor

Otomatik testler:

```bash
npm run lint
npm test
npm run build
```

---

## 4. Docker ile çalıştırma (alternatif)

`.env.local` hazır olduktan sonra:

```bash
docker compose up --build
```

- Uygulama: [http://localhost:3000](http://localhost:3000)
- Firebase ve Neon yine **harici** servislerdir; compose içinde Postgres yoktur
- Build sırasında `NEXT_PUBLIC_*` değerleri imaja gömülür; değiştirdiğinizde `--build` ile yeniden derleyin

---

## 5. Sık karşılaşılan sorunlar

| Belirti | Olası neden | Çözüm |
|---------|-------------|--------|
| Google giriş popup hata | `localhost` authorized değil | Firebase → Authorized domains |
| API 401 / 503 | Admin SDK veya token | `FIREBASE_ADMIN_*` kontrol; tarayıcıda çıkış yapıp tekrar giriş |
| API 500 favorites | DB bağlantısı | `DATABASE_URL` pooled string; migration’lar uygulandı mı |
| `psql: command not found` | Client yok | Adım 1’deki `psql` kurulumu |
| Migration hata | Yanlış URL | `DATABASE_URL_UNPOOLED` **direct** olmalı |
| Mekan listesi boş | Overpass gecikmesi / rate limit | Birkaç saniye bekleyin; farklı konum deneyin |
| AI sohbet 503 | Key yok | `OPENAI_API_KEY` ekleyin veya özelliği atlayın |
| `FIREBASE_ADMIN_PRIVATE_KEY` parse hata | Yanlış format | JSON’dan kopyala; çift tırnak + `\n` |

---

## 6. Kurulum checklist

Kendi makinenizde tam kurulum için:

- [ ] Node 20+ ve `npm install` tamam
- [ ] Neon projesi; pooled + direct URL’ler `.env.local`’da
- [ ] Üç migration sırasıyla uygulandı (`001`, `002`, `003`)
- [ ] Firebase Auth: Google + Email/Password açık
- [ ] `NEXT_PUBLIC_FIREBASE_*` ve `FIREBASE_ADMIN_*` dolu
- [ ] `localhost` authorized domain’de
- [ ] `npm run dev` → harita ve mekanlar çalışıyor
- [ ] Giriş → tercih kaydı ve favori çalışıyor
- [ ] (Opsiyonel) `OPENAI_API_KEY` → sohbet çalışıyor
- [ ] `npm test` ve `npm run build` yeşil

---

## 7. Sonraki adımlar

- Mimari ve algoritma: [../../README.md](../../README.md)
- Fonksiyon davranışları: [functions/](./functions/README.md)
- Production deploy: kök README → **Production dağıtım (Vercel)**
