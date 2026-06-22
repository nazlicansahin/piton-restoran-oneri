import { z } from "zod";

export const PLACE_ID_REGEX = /^(node|way|relation)\/[0-9]+$/;

export const placeIdSchema = z
  .string()
  .regex(PLACE_ID_REGEX, "placeId must look like node/123, way/123 or relation/123");

/** Place snapshot body shared by favorites and group favorites. */
export const placeSnapshotSchema = z.object({
  name: z.string().trim().max(200).nullish(),
  cuisine: z.string().trim().max(120).nullish(),
  address: z.string().trim().max(400).nullish(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type PlaceSnapshot = z.infer<typeof placeSnapshotSchema>;

export const preferencesSchema = z.object({
  maxDistanceKm: z.coerce.number().min(0.1).max(50),
  cuisines: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
});

export const createGroupSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).nullish(),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
});

export const groupFavoriteSchema = placeSnapshotSchema.extend({
  placeId: placeIdSchema,
  note: z.string().trim().max(300).nullish(),
});
