/** Default model routed through Vercel AI Gateway (override via CHAT_MODEL). */
export const CHAT_MODEL =
  process.env.CHAT_MODEL ?? "google/gemini-2.5-flash";

/** True when the gateway can authenticate (API key, OIDC on Vercel, or local dev key). */
export function isChatConfigured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim() ||
      process.env.VERCEL_ENV,
  );
}
