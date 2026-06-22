"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Send, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/I18nProvider";
import type { ChatContextPayload } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface RestaurantChatProps {
  context: ChatContextPayload;
  onSelectPlace?: (placeId: string) => void;
}

export function RestaurantChat({ context, onSelectPlace }: RestaurantChatProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const contextRef = useRef(context);
  contextRef.current = context;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ context: contextRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const handlePlaceLink = (text: string) => {
    const match = text.match(/\[([^\]]+)\]/);
    if (match && onSelectPlace) onSelectPlace(match[1]);
  };

  return (
    // z-[1100]: above Leaflet panes (400–700) and controls (1000). During zoom
    // Leaflet transforms tile layers, which would bury a lower z-index overlay.
    <div className="pointer-events-none absolute bottom-4 right-4 z-[1100] flex flex-col items-end gap-2">
      {open && (
        <Card className="pointer-events-auto flex h-[min(70vh,520px)] w-[min(calc(100vw-2rem),380px)] flex-col shadow-lg">
          <header className="flex items-center justify-between border-b px-3 py-2">
            <div>
              <p className="text-sm font-semibold">{t("chat.title")}</p>
              <p className="text-xs text-muted-foreground">{t("chat.subtitle")}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("chat.close")}
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                {t("chat.welcome")}
              </p>
            )}
            {messages.map((m) => {
              const text = messageText(m);
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[92%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    isUser
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {text}
                  {!isUser && onSelectPlace && (
                    <button
                      type="button"
                      className="mt-1 block text-xs underline opacity-80"
                      onClick={() => handlePlaceLink(text)}
                    >
                      {t("chat.showOnMap")}
                    </button>
                  )}
                </div>
              );
            })}
            {error && (
              <p className="text-xs text-destructive">
                {error.message || t("chat.error")}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              disabled={busy}
              aria-label={t("chat.placeholder")}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

      <Button
        className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
        size="icon"
        aria-label={open ? t("chat.close") : t("chat.open")}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}
