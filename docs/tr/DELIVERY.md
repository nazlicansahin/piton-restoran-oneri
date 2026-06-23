# Teslim beklentileri (PITON PDF)

Bu dosya, **PTN-RestoranOneri-V.1.0** dokümanının **§4 Teslim Beklentileri** maddeleri ile bu repodaki karşılıkları eşler.

| | |
|---|---|
| **Kaynak PDF** | `PTN-RestoranOneri-V.1.0-260612.pdf` — Bölüm 4 |
| **Teslim e-postası** | hr@piton.com.tr |
| **Public repo** | [github.com/nazlicansahin/piton-restoran-oneri](https://github.com/nazlicansahin/piton-restoran-oneri) |
| **Canlı demo** | [piton-restoran-oneri.vercel.app](https://piton-restoran-oneri.vercel.app) |

---

## 4.1 GitHub reposu

| Beklenti | Durum | Kanıt |
|----------|--------|-------|
| Kaynak kod açık ve erişilebilir public repo | ✅ | [nazlicansahin/piton-restoran-oneri](https://github.com/nazlicansahin/piton-restoran-oneri) |

---

## 4.2 README.md (zorunlu içerik)

PDF, kök `README.md` içinde dört başlık ister. Detaylar `docs/tr/` altına dağıtıldı; kök README özet + link sağlar.

| PDF maddesi | Açıklama | Dokümantasyon | Durum |
|-------------|----------|---------------|--------|
| **Kurulum (Setup)** | Yerel kurulum, env adım adım | [README.md](./README.md) · [Kök README](../../README.md#kurulum-kılavuzu) | ✅ |
| **Dosya yapısı** | Klasör yapısı + modül işlevleri | [STRUCTURE.md](./STRUCTURE.md) | ✅ |
| **Kullanım (Usage)** | Teknik tercih gerekçeleri + akış | [USAGE.md](./USAGE.md) | ✅ |
| **Görseller** | Açıklamalı ekran görüntüleri | [screenshots/README.md](./screenshots/README.md) · [Kök README](../../README.md#ekran-görüntüleri) | ✅ |

---

## 4.3 Video kaydı

| Beklenti | Durum | Not |
|----------|--------|-----|
| Kurulum, kullanım senaryosu ve önemli teknik tercihleri anlatan kısa video | ⏳ | Henüz yüklenmedi |

### Önerilen video içeriği (3–5 dk)

1. Repoyu klonlama ve `npm run dev` (veya canlı URL)
2. Konum / şehir arama → harita ve mekan listesi
3. Tercih paneli → **Senin İçin En Uygun Mekanlar** sıralamasının değişmesi
4. Giriş → favori ekleme → Favoriler sayfası
5. Kısa teknik özet: Next.js API routes, Overpass, Firebase + Neon
6. *(Bonus)* koyu mod, dil değiştirme, AI sohbet

Videoyu YouTube (unlisted) veya Drive’a yükleyip **repo linki ile birlikte** `hr@piton.com.tr` adresine gönderin. İsteğe bağlı: kök README veya bu dosyaya video URL’si ekleyin.

---

## 4.4 Teslimat

| Adım | Durum |
|------|--------|
| Repo public | ✅ |
| Link + video `hr@piton.com.tr` | ⏳ Video bekleniyor |

---

## Proje kapsamı karşılama özeti (PDF §1)

| Kapsam maddesi | Karşılama | Not |
|----------------|-----------|-----|
| Konum + harita marker | ✅ | Geolocation API, Leaflet, arama merkezi |
| Canlı veri (ad, mutfak, adres) | ✅ | Overpass + Nominatim proxy |
| Tercih profili (mutfak, mesafe, **fiyat**) | ⚠️ Kısmi | Mutfak + mesafe ✅; fiyat OSM veri seyrekliği nedeniyle UI’da yok — bkz. [USAGE.md](./USAGE.md) |
| Kişiselleştirilmiş öneri algoritması | ✅ | `lib/recommend.ts`, **Uyum: N%** |
| Lokal veri (LocalStorage / SQLite) | ⚠️ Alternatif | Firebase Auth + Neon Postgres — kalıcılık gereksinimini aşar; bkz. [USAGE.md](./USAGE.md) |

---

## Bonus beklentiler (PDF §3)

| Bonus | Durum |
|-------|--------|
| Karanlık / aydınlık tema | ✅ `next-themes` |
| AI chatbot | ✅ `/api/chat` + OpenAI |
| Production deploy | ✅ Vercel |
| Çoklu dil (i18n) | ✅ TR / EN |
| CI/CD (lint, test, build) | ⚠️ Kısmi | GitHub Actions: lint + build + Docker; `npm test` yerelde — bkz. [USAGE.md](./USAGE.md#cicd) |

---

## Dokümantasyon haritası

```
docs/tr/
├── README.md           ← Kurulum (Setup)
├── STRUCTURE.md        ← Dosya yapısı
├── USAGE.md            ← Kullanım + teknik tercihler
├── DELIVERY.md         ← Bu dosya (teslim checklist)
├── screenshots/README  ← Açıklamalı görseller
└── functions/          ← Fonksiyon referansı
```

English: [docs/en/DELIVERY.md](../en/DELIVERY.md)
