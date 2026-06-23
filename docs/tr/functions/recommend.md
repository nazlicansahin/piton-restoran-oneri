# Öneri motoru fonksiyonları

**Senin İçin En Uygun Mekanlar** listesini besleyen saf, deterministik skorlama. Ağ veya DB erişimi yoktur; aynı girdi her zaman aynı sıralamayı üretir.

### `rankPlaces`

- **Dosya:** `lib/recommend.ts`
- **Amaç:** Yakındaki mekanları ağırlıklı skorla sıralar ve okunabilir rozet nedenleri üretir.
- **Nasıl çalışır:**
  1. Sert filtre: `preferences.maxDistanceKm` dışındaki mekanlar elenir
  2. Kalan her mekan iki eksende (0–100) puanlanır:
     - `distance` = `100 * (1 - distanceKm / maxDistanceKm)`
     - `cuisine` = tam eşleşme 100, mutfak etiketi yok 30, kullanıcı mutfak seçmemiş 50, aksi halde 0
  3. **%50 mesafe + %50 mutfak** birleştirilir → `totalScore` (UI'da **Uyum: N%**)
  4. `history` yalnızca rozetler için hesaplanır (favoride 100; favori mutfağa benziyor 70; değilse 0) — `totalScore`'a **eklenmez**
  5. Toplam skor ↓, mesafe ↑, isim ↑ ile sıralanır
- **Girdiler:** `{ places, preferences, favoriteSignals }`
- **Dönüş:** `totalScore`, `scoreBreakdown`, `reasons` içeren `RecommendationItem[]`
- **Yan etkiler:** Yok (saf)

### `expandSelectedCuisines`

- **Dosya:** `lib/cuisine.ts`
- **Amaç:** Kullanıcı mutfak seçimlerini (ör. "İtalyan") ilgili OSM etiket kümesine genişletir (`italian`, `pizza`, `pasta`).
- **Dönüş:** `Set<string>`
- **Yan etkiler:** Yok (saf)

### `parsePlaceCuisines`

- **Dosya:** `lib/cuisine.ts`
- **Amaç:** OSM `cuisine` etiketini noktalı virgül/virgülle ayrılmış parçalara böler ve normalize eder.
- **Dönüş:** `string[]`
- **Yan etkiler:** Yok (saf)

### `formatCuisineDisplay`

- **Dosya:** `lib/cuisine.ts`
- **Amaç:** Mekan kartları için OSM mutfak etiketlerini biçimlendirir (`_` → boşluk, ` · ` ile birleştirme).
- **Dönüş:** `string`
- **Yan etkiler:** Yok (saf)
