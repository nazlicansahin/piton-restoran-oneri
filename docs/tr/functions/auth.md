# Auth fonksiyonları

Kimlik doğrulama Firebase kullanır (Google + e-posta/şifre, anonim yok). Oturum istemcidedir; sunucu ID token doğrular ve her kullanıcıyı Postgres satırına eşler.

### `verifyToken`

- **Dosya:** `lib/auth/verify-token.ts`
- **Amaç:** Korumalı API rotalarında `Authorization: Bearer <token>` başlığındaki Firebase ID token'ını doğrular.
- **Nasıl çalışır:**
  1. Başlık eksik veya Bearer değilse reddeder
  2. `FIREBASE_ADMIN_*` env ile Firebase Admin uygulamasını lazy init eder
  3. `admin.auth().verifyIdToken()` çağırır ve decode edilmiş kimliği döner
- **Girdiler:** `authorizationHeader: string | null`
- **Dönüş:** `VerifiedUser` — `firebaseUid`, `email`, `name`, `picture`
- **Yan etkiler:** İlk çağrıda Admin SDK singleton başlatılır
- **Fırlatır:** `missing_bearer_token`, `admin_not_configured` veya Firebase doğrulama hataları

### `getOrCreateUser`

- **Dosya:** `lib/auth/get-or-create-user.ts`
- **Amaç:** Doğrulanmış Firebase kullanıcısını dahili `users` satırına eşler; ilk görüşte oluşturur.
- **Nasıl çalışır:** `firebase_uid` üzerinde upsert; `email`/`display_name`/`photo_url` güncellenir; dahili id döner.
- **Girdiler:** `VerifiedUser`
- **Dönüş:** `AppUser` — `id`, `firebaseUid`, `email`, `displayName`
- **Yan etkiler:** `users` tablosuna yazar
- **Bağımlılıklar:** `lib/db.ts` (Neon serverless client)

### `AuthProvider` / `useAuth`

- **Dosya:** `components/providers/AuthProvider.tsx`
- **Amaç:** Mevcut kullanıcı ve giriş/çıkış aksiyonlarını sunan istemci tarafı auth context.
- **Nasıl çalışır:** `onAuthStateChanged` dinler; aksiyonları memoize eder (`signInWithGoogle`, `signInWithEmail`, `registerWithEmail`, `signOut`, `getToken`).
- **Dönüş (`useAuth`):** `{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, signOut, getToken }`
- **Yan etkiler:** Uygulama ömrü boyunca Firebase auth listener
