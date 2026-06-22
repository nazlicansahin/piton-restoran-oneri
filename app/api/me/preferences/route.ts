import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { preferencesSchema } from "@/lib/validation";
import type { PreferencesDto } from "@/lib/types";

interface PreferencesRow {
  max_distance_km: string | number;
  cuisines: string[];
  updated_at: string | null;
}

const DEFAULTS: PreferencesDto = {
  maxDistanceKm: 3,
  cuisines: [],
  updatedAt: null,
};

function toDto(row: PreferencesRow | undefined): PreferencesDto {
  if (!row) return DEFAULTS;
  return {
    maxDistanceKm: Number(row.max_distance_km),
    cuisines: row.cuisines ?? [],
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function GET(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const rows = (await sql`
      select max_distance_km, cuisines, updated_at
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

    const { maxDistanceKm, cuisines } = body.data;

    const rows = (await sql`
      insert into user_preferences (user_id, max_distance_km, cuisines, updated_at)
      values (${user.id}, ${maxDistanceKm}, ${cuisines}, now())
      on conflict (user_id) do update
        set max_distance_km = excluded.max_distance_km,
            cuisines = excluded.cuisines,
            updated_at = now()
      returning max_distance_km, cuisines, updated_at
    `) as PreferencesRow[];

    return NextResponse.json({ item: toDto(rows[0]) });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
