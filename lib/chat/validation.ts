import { z } from "zod";
import { LOCALES } from "@/lib/i18n/dictionaries";

const placeSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  cuisine: z.string().nullable(),
  address: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  category: z.enum(["restaurant", "cafe", "fast_food"]),
  distanceKm: z.number(),
});

export const chatContextSchema = z.object({
  locale: z.enum(LOCALES),
  userLocation: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  preferences: z.object({
    cuisines: z.array(z.string()).max(20),
    maxDistanceKm: z.number().min(0.5).max(20),
  }),
  favorites: z
    .array(
      z.object({
        placeId: z.string(),
        name: z.string().nullable(),
        cuisine: z.string().nullable(),
        address: z.string().nullable(),
        lat: z.number(),
        lng: z.number(),
        createdAt: z.string(),
      }),
    )
    .max(50),
  places: z.array(placeSchema).max(100),
  recommendations: z
    .array(
      z.object({
        placeId: z.string(),
        totalScore: z.number(),
        scoreBreakdown: z.object({
          distance: z.number(),
          cuisine: z.number(),
          history: z.number(),
        }),
        reasons: z.array(z.string()),
      }),
    )
    .max(20),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.record(z.string(), z.unknown())),
});

export const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).max(40),
  context: chatContextSchema,
});
