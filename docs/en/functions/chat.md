# Chat assistant (`lib/chat/*`, `/api/chat`)

Grounded AI restaurant assistant: answers only from the current nearby place list and scored recommendations.

## `buildChatSystemPrompt(context)`

Builds the system prompt injected into `streamText`. Includes user location, saved preferences, favorites, algorithm top picks, and up to 25 nearby places with OSM ids. Instructs the model to never invent venues.

## `resolveChatModel()` / `getChatProvider()` (`lib/chat/config.ts`)

Uses **OpenAI** when `OPENAI_API_KEY` is set; otherwise **Vercel AI Gateway**. Default OpenAI model: `gpt-4o-mini`.

## `POST /api/chat`

- **Body:** `{ messages: UIMessage[], context: ChatContextPayload }`
- **Auth:** none (public; context is client-supplied place snapshot)
- **Model:** `OPENAI_API_KEY` → `gpt-4o-mini` (preferred); else AI Gateway via `CHAT_MODEL`
- **Response:** UI message stream (`toUIMessageStreamResponse`)
- **503** when AI Gateway is not configured

## `RestaurantChat` (client)

Floating panel on the home page. Sends live `places`, `preferences`, `favorites`, and `recommendations` with each request via `DefaultChatTransport` body.
