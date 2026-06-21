import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { placeIdSchema, placeSnapshotSchema } from "@/lib/validation";

interface RouteContext {
  params: { placeId: string[] };
}

function resolvePlaceId(params: { placeId: string[] }): string {
  const placeId = params.placeId.join("/");
  const parsed = placeIdSchema.safeParse(placeId);
  if (!parsed.success) {
    throw new ApiException("invalid_place_id", "Geçersiz mekan kimliği.", 400);
  }
  return parsed.data;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const placeId = resolvePlaceId(params);

    const body = placeSnapshotSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) {
      throw new ApiException("invalid_body", "Eksik veya hatalı mekan bilgisi.", 400, {
        fieldErrors: body.error.flatten().fieldErrors,
      });
    }

    const { name, cuisine, address, lat, lng } = body.data;

    await sql`
      insert into places (id, name, cuisine, address, lat, lng, last_seen_at)
      values (${placeId}, ${name ?? null}, ${cuisine ?? null}, ${address ?? null}, ${lat}, ${lng}, now())
      on conflict (id) do update
        set name = excluded.name,
            cuisine = excluded.cuisine,
            address = excluded.address,
            lat = excluded.lat,
            lng = excluded.lng,
            last_seen_at = now()
    `;

    await sql`
      insert into favorites (user_id, place_id)
      values (${user.id}, ${placeId})
      on conflict (user_id, place_id) do nothing
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const placeId = resolvePlaceId(params);

    await sql`
      delete from favorites
      where user_id = ${user.id} and place_id = ${placeId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
