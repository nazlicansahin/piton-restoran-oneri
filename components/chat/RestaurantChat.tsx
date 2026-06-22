"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MapPin, MessageCircle, Send, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  resolvePlacesFromText,
  stripPlaceIdMarkers,
} from "@/lib/chat/place-refs";
import type { ChatContextPayload } from "@/lib/chat/types";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function ChatPlaceCards({
  places,
  onSelectPlace,
}: {
  places: Place[];
  onSelectPlace?: (placeId: string) => void;
}) {
  const { t } = useI18n();

  if (places.length === 0 || !onSelectPlace) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {places.map((place) => (
        <div
          key={place.id}
          className="rounded-lg border border-border/80 bg-background p-2.5"
        >
          <p className="font-medium leading-tight">
            {place.name ?? t("place.unnamed")}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {place.cuisine ?? t("place.noCuisine")} ·{" "}
              {place.distanceKm.toFixed(2)} km
            </span>
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 h-auto px-0 text-xs"
            onClick={() => onSelectPlace(place.id)}
          >
            {t("chat.showOnMap")}
          </Button>
        </div>
      ))}
    </div>
  );
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
              const rawText = messageText(m);
              const isUser = m.role === "user";
              const suggestedPlaces = !isUser
                ? resolvePlacesFromText(rawText, context.places)
                : [];
              const displayText = !isUser
                ? stripPlaceIdMarkers(rawText)
                : rawText;

              return (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[92%] rounded-lg px-3 py-2 text-sm",
                    isUser
                      ? "ml-auto whitespace-pre-wrap bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {displayText && (
                    <p className="whitespace-pre-wrap">{displayText}</p>
                  )}
                  {!isUser && (
                    <ChatPlaceCards
                      places={suggestedPlaces}
                      onSelectPlace={onSelectPlace}
                    />
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
