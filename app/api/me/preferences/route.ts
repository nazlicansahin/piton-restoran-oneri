import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { preferencesSchema } from "@/lib/validation";
import type { PreferencesDto, PriceTier } from "@/lib/types";

interface PreferencesRow {
  max_distance_km: string | number;
  price_preference: PriceTier | null;
  cuisines: string[];
  updated_at: string | null;
}

const DEFAULTS: PreferencesDto = {
  maxDistanceKm: 3,
  pricePreference: null,
  cuisines: [],
  updatedAt: null,
};

function toDto(row: PreferencesRow | undefined): PreferencesDto {
  if (!row) return DEFAULTS;
  return {
    maxDistanceKm: Number(row.max_distance_km),
    pricePreference: row.price_preference,
    cuisines: row.cuisines ?? [],
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function GET(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const rows = (await sql`
      select max_distance_km, price_preference, cuisines, updated_at
      from user_preferences
      where user_id = ${user.id}
    `) as PreferencesRow[];

    return NextResponse.json({ item: toDto(rows[0]) });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}

export async function PUT(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);

    const body = preferencesSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) {
      throw new ApiException("invalid_body", "Geçersiz tercih bilgisi.", 400, {
        fieldErrors: body.error.flatten().fieldErrors,
      });
    }

    const { maxDistanceKm, pricePreference, cuisines } = body.data;

    const rows = (await sql`
      insert into user_preferences (user_id, max_distance_km, price_preference, cuisines, updated_at)
      values (${user.id}, ${maxDistanceKm}, ${pricePreference ?? null}, ${cuisines}, now())
      on conflict (user_id) do update
        set max_distance_km = excluded.max_distance_km,
            price_preference = excluded.price_preference,
            cuisines = excluded.cuisines,
            updated_at = now()
      returning max_distance_km, price_preference, cuisines, updated_at
    `) as PreferencesRow[];

    return NextResponse.json({ item: toDto(rows[0]) });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
