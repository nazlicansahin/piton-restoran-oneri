/** Map gateway/provider failures to user-safe chat error text. */
export function formatChatStreamError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  if (
    message.includes("insufficient_quota") ||
    message.includes("exceeded your current quota")
  ) {
    return "OpenAI API quota exceeded. Check billing and usage at platform.openai.com.";
  }

  if (
    message.includes("credit card") ||
    message.includes("customer_verification_required")
  ) {
    return "Vercel AI Gateway needs a credit card on your team account to unlock free credits. Add one in Vercel → AI Gateway settings, or set OPENAI_API_KEY instead.";
  }

  if (message.includes("Incorrect API key") || message.includes("invalid_api_key")) {
    return "OpenAI API key is invalid. Check OPENAI_API_KEY in your environment.";
  }

  if (message.includes("ai_not_configured") || message.includes("403")) {
    return "AI assistant is not configured. Set OPENAI_API_KEY or AI_GATEWAY_API_KEY.";
  }

  return "Could not generate a reply. Please try again.";
}
