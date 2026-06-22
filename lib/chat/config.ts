import { openai } from "@ai-sdk/openai";
import { gateway, type LanguageModel } from "ai";

/** OpenAI model when OPENAI_API_KEY is set (cheap default for small credit). */
export const OPENAI_CHAT_MODEL =
  process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

/** Gateway model fallback when only AI Gateway is configured. */
export const GATEWAY_CHAT_MODEL =
  process.env.CHAT_MODEL ?? "google/gemini-2.5-flash";

export type ChatProvider = "openai" | "gateway";

/** Which backend will handle chat requests in this environment. */
export function getChatProvider(): ChatProvider | null {
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim() ||
    process.env.VERCEL_ENV
  ) {
    return "gateway";
  }
  return null;
}

export function isChatConfigured(): boolean {
  return getChatProvider() !== null;
}

/** Prefer OpenAI direct billing; fall back to Vercel AI Gateway. */
export function resolveChatModel(): LanguageModel {
  const provider = getChatProvider();
  if (provider === "openai") {
    return openai(OPENAI_CHAT_MODEL);
  }
  if (provider === "gateway") {
    return gateway(GATEWAY_CHAT_MODEL);
  }
  throw new Error("No chat provider configured");
}
