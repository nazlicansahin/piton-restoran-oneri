# Mekan ve konum fonksiyonları

Yakındaki mekanlar OpenStreetMap Overpass API'den gelir; tarayıcının Overpass'ı doğrudan çağırmaması için public route üzerinden proxy edilir.

### `fetchNearbyPlaces`

- **Dosya:** `lib/overpass.ts`
- **Amaç:** Bir koordinat çevresindeki restoran, kafe ve fast-food mekanlarını getirir ve normalize eder.
- **Nasıl çalışır:**
  1. `radiusM` içinde `amenity in (restaurant, cafe, fast_food)` için Overpass QL sorgusu oluşturur
  2. `User-Agent` ile Overpass'a POST eder (zorunlu, yoksa `406`)
  3. Elemanları `Place`'e map eder, mesafe hesaplar, koordinatsız kayıtları atar
  4. Mesafeye göre artan sıralar
- **Girdiler:** `lat`, `lng`, `radiusM`
- **Dönüş:** `Place[]`
- **Yan etkiler:** Overpass ağ çağrısı (25 sn timeout)

### `getCachedNearbyPlaces`

- **Dosya:** `lib/places-cache.ts`
- **Amaç:** Overpass yanıtlarını koordinat/yarıçap bucket ile 5 dakika önbelleğe alır (`unstable_cache`).
- **Girdiler:** `lat`, `lng`, `radiusM`
- **Dönüş:** `Place[]`
- **Yan etkiler:** Önbellek miss'te Overpass çağrısı

### `buildOverpassQuery`

- **Dosya:** `lib/overpass.ts`
- **Amaç:** Koordinat + yarıçap için Overpass QL dizesi üretir.
- **Dönüş:** `string`
- **Yan etkiler:** Yok (saf)

### `haversineKm`

- **Dosya:** `lib/haversine.ts`
- **Amaç:** İki koordinat arasında büyük daire mesafesi (kilometre).
- **Girdiler:** `lat1`, `lng1`, `lat2`, `lng2`
- **Dönüş:** `number` (km)
- **Yan etkiler:** Yok (saf)

### `useGeolocation`

- **Dosya:** `hooks/useGeolocation.ts`
- **Amaç:** Tarayıcı Geolocation API için React hook; izin durumları ve Eskişehir yedek konumu.
- **Dönüş:** `{ lat, lng, status, error, request, fallback }`
- **Yan etkiler:** Mount'ta cihaz konumu ister (`enableHighAccuracy: false`)
