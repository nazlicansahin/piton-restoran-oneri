# Chat assistant (`lib/chat/*`, `/api/chat`)

Grounded AI restaurant assistant: answers only from the current nearby place list and scored recommendations.

## `buildChatSystemPrompt(context)`

Builds the system prompt injected into `streamText`. Includes user location, saved preferences, favorites, algorithm top picks, and up to 25 nearby places with OSM ids. Instructs the model to never invent venues.

## `isChatConfigured()` (`lib/chat/config.ts`)

Returns true when `AI_GATEWAY_API_KEY`, `VERCEL_OIDC_TOKEN`, or `VERCEL_ENV` is set so `/api/chat` can authenticate with Vercel AI Gateway.

## `POST /api/chat`

- **Body:** `{ messages: UIMessage[], context: ChatContextPayload }`
- **Auth:** none (public; context is client-supplied place snapshot)
- **Model:** `CHAT_MODEL` env or `google/gemini-2.5-flash` via AI Gateway
- **Response:** UI message stream (`toUIMessageStreamResponse`)
- **503** when AI Gateway is not configured

## `RestaurantChat` (client)

Floating panel on the home page. Sends live `places`, `preferences`, `favorites`, and `recommendations` with each request via `DefaultChatTransport` body.
