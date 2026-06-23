# Favoriler, gruplar ve tercihler fonksiyonları

Faz 2 kalıcılığı: korumalı REST rotaları (Firebase token → dahili kullanıcı) ve optimistik UI'ı yöneten istemci hook/store.

## Sunucu yardımcıları

### `requireUser`

- **Dosya:** `lib/auth/require-user.ts`
- **Amaç:** Korumalı route için kimliği doğrulanmış uygulama kullanıcısını çözer; ilk görüşte `users` satırı oluşturur.
- **Nasıl çalışır:** `Authorization` başlığını okur, Firebase ID token doğrular, `users.id` ile eşler.
- **Dönüş:** `AppUser`
- **Fırlatır:** `ApiException` 401 (geçersiz token) / 503 (admin yapılandırılmamış)

### `requireMembership` / `getMembershipRole`

- **Dosya:** `lib/groups.ts`
- **Amaç:** Grup erişimini yetkilendirir; isteğe bağlı olarak `owner`/`admin` ile kısıtlar.
- **Dönüş:** çağıranın `GroupRole` değeri
- **Fırlatır:** Üye değil veya rol yetersizse `ApiException` 403

### `toErrorResponse` / `ApiException` / `makeRequestId`

- **Dosya:** `lib/http.ts`
- **Amaç:** Standart hata zarfı `{ code, message, details?, requestId }` ve HTTP status'a map edilen tip hata sınıfı.
- **Yan etkiler:** İşlenmeyen hataları request ID ile loglar

## API rotaları

- `GET /api/favorites`, `PUT|DELETE /api/favorites/:placeId` — kişisel favoriler (mekan snapshot upsert + favori bağlantısı).
- `GET|PUT /api/me/preferences` — tercih profili (mesafe, mutfaklar).
- `GET|POST /api/groups`, `GET /api/groups/:id` — grup listele/oluştur (transactional owner üyeliği) ve üyelerle detay.
- `GET|POST /api/groups/:id/favorites`, `DELETE /api/groups/:id/favorites/:placeId` — paylaşımlı grup favorileri (mutasyonlar owner/admin).
- `POST /api/groups/:id/invites` — token + 7 gün süreli e-posta daveti (yalnızca owner/admin).

Mekan ID'leri slash içerir (`node/123`); favori rotaları catch-all `[...placeId]` segmentleri kullanır.

## İstemci

### `useUserData`

- **Dosya:** `hooks/useUserData.ts`
- **Amaç:** Auth sonrası favoriler + tercihleri yükler; `toggleFavorite`, `savePreferences`, `isFavorite` sunar.
- **Nasıl çalışır:** Optimistik favori toggle önce Zustand store'a yazar, sonra API; hata durumunda geri alır + toast.

### `useAppStore`

- **Dosya:** `store/useAppStore.ts`
- **Amaç:** Favoriler (sunucu state), tercihler ve UI state (`selectedPlaceId`) için Zustand önbelleği. Kaynak gerçeği sunucudadır.

### `api`

- **Dosya:** `lib/api-client.ts`
- **Amaç:** Bearer token ekleyen ve hata zarfını `ApiClientError`'a parse eden tipli fetch sarmalayıcı.
