# Sohbet asistanı (`lib/chat/*`, `/api/chat`)

Yerleşik AI restoran asistanı: yanıtlar yalnızca mevcut yakın mekan listesi ve skorlanmış önerilerden üretilir.

## `buildChatSystemPrompt(context)`

`streamText` içine enjekte edilen system prompt'u oluşturur. Kullanıcı konumu, kayıtlı tercihler, favoriler, algoritma top pick'leri ve OSM id'li en fazla 25 yakın mekanı içerir. Modele uydurma mekan üretmemesini söyler.

## `resolveChatModel()` / `getChatProvider()` (`lib/chat/config.ts`)

`OPENAI_API_KEY` varsa **OpenAI**; yoksa **Vercel AI Gateway**. Varsayılan OpenAI modeli: `gpt-4o-mini`.

## `POST /api/chat`

- **Body:** `{ messages: UIMessage[], context: ChatContextPayload }`
- **Auth:** yok (public; context istemciden gelen mekan snapshot'ı)
- **Model:** `OPENAI_API_KEY` → `gpt-4o-mini` (tercih edilen); aksi halde AI Gateway (`CHAT_MODEL`)
- **Yanıt:** UI message stream (`toUIMessageStreamResponse`)
- **503** AI yapılandırılmamışsa

## `RestaurantChat` (istemci)

Ana sayfadaki yüzen panel. Her istekte canlı `places`, `preferences`, `favorites` ve `recommendations` verisini `DefaultChatTransport` body ile gönderir.
