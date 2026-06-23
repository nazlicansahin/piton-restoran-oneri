# Fonksiyon dokümantasyonu indeksi

Dokümante edilmiş fonksiyonların kanonik kaydı. Yeni bir `docs/tr/functions/<domain>.md` dosyası oluşturduğunuzda (ve `docs/en/functions/` altındaki İngilizce karşılığını) tabloya satır ekleyin.

| Domain dosyası | Modül / alan | Durum |
|----------------|--------------|-------|
| [recommend.md](./recommend.md) | Öneri skorlama (`lib/recommend.ts`, `lib/cuisine.ts`) | Uygulandı (Faz 2) |
| [favorites-groups.md](./favorites-groups.md) | Favoriler, gruplar, tercihler API + istemci state | Uygulandı (Faz 2) |
| [chat.md](./chat.md) | AI sohbet asistanı (`lib/chat/*`, `/api/chat`, `RestaurantChat`) | Uygulandı (Faz 3) |
| [auth.md](./auth.md) | Auth yardımcıları (`lib/auth/*`, `AuthProvider`) | Uygulandı (Faz 1) |
| [places.md](./places.md) | Mekan + konum yardımcıları (`lib/overpass.ts`, `lib/places-cache.ts`, `useGeolocation`) | Uygulandı (Faz 1) |

## Yeni domain ekleme

1. `docs/tr/functions/<domain>.md` ve `docs/en/functions/<domain>.md` oluşturun
2. Her iki README indeksine satır ekleyin
3. [FUNCTION_DOCUMENTATION.md](../FUNCTION_DOCUMENTATION.md) şablonunu izleyin

---

## Proje kurulumu

Projeyi yerel makinede kurmak için adım adım rehber: **[../README.md](../README.md)**  
English: [../../en/README.md](../../en/README.md) · Proje genel bakış: [../../README.md](../../README.md)
