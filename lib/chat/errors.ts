/** Map gateway/provider failures to user-safe chat error text. */
export function formatChatStreamError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  if (
    message.includes("credit card") ||
    message.includes("customer_verification_required")
  ) {
    return "Vercel AI Gateway needs a credit card on your team account to unlock free credits. Add one in Vercel → AI Gateway settings, then retry.";
  }

  if (message.includes("ai_not_configured") || message.includes("403")) {
    return "AI assistant is not configured. Set AI_GATEWAY_API_KEY on Vercel.";
  }

  return "Could not generate a reply. Please try again.";
}
