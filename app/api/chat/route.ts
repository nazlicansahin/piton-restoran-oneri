import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { buildChatSystemPrompt } from "@/lib/chat/prompt";
import { resolveChatModel, isChatConfigured } from "@/lib/chat/config";
import { formatChatStreamError } from "@/lib/chat/errors";
import { chatRequestSchema } from "@/lib/chat/validation";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";

export const maxDuration = 30;

export async function POST(req: Request) {
  const requestId = makeRequestId();
  try {
    if (!isChatConfigured()) {
      throw new ApiException(
        "ai_not_configured",
        "AI assistant is not configured on this deployment.",
        503,
      );
    }

    const json = await req.json();
    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiException(
        "validation_error",
        "Invalid chat request.",
        400,
        { issues: parsed.error.flatten() },
      );
    }

    const { messages, context } = parsed.data;
    const system = buildChatSystemPrompt(context);
    const uiMessages = messages as unknown as UIMessage[];

    const result = streamText({
      model: resolveChatModel(),
      system,
      messages: await convertToModelMessages(uiMessages),
      maxOutputTokens: 500,
      temperature: 0.4,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
      onError: formatChatStreamError,
    });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
