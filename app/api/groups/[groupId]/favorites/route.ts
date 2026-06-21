import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { assertGroupId, requireMembership } from "@/lib/groups";
import { groupFavoriteSchema } from "@/lib/validation";
import type { GroupFavoriteDto } from "@/lib/types";

interface RouteContext {
  params: { groupId: string };
}

interface GroupFavoriteRow {
  place_id: string;
  name: string | null;
  cuisine: string | null;
  address: string | null;
  lat: number;
  lng: number;
  note: string | null;
  added_by_name: string | null;
  created_at: string;
}

export async function GET(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const groupId = assertGroupId(params.groupId);
    await requireMembership(user.id, groupId);

    const rows = (await sql`
      select gf.place_id, p.name, p.cuisine, p.address, p.lat, p.lng, gf.note,
             u.display_name as added_by_name, gf.created_at
      from group_favorites gf
      join places p on p.id = gf.place_id
      left join users u on u.id = gf.added_by_user_id
      where gf.group_id = ${groupId}
      order by gf.created_at desc
    `) as GroupFavoriteRow[];

    const items: GroupFavoriteDto[] = rows.map((r) => ({
      placeId: r.place_id,
      name: r.name,
      cuisine: r.cuisine,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      note: r.note,
      addedByName: r.added_by_name,
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const groupId = assertGroupId(params.groupId);
    await requireMembership(user.id, groupId, ["owner", "admin"]);

    const body = groupFavoriteSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) {
      throw new ApiException("invalid_body", "Eksik veya hatalı mekan bilgisi.", 400, {
        fieldErrors: body.error.flatten().fieldErrors,
      });
    }

    const { placeId, name, cuisine, address, lat, lng, note } = body.data;

    await sql`
      insert into places (id, name, cuisine, address, lat, lng, last_seen_at)
      values (${placeId}, ${name ?? null}, ${cuisine ?? null}, ${address ?? null}, ${lat}, ${lng}, now())
      on conflict (id) do update
        set name = excluded.name, cuisine = excluded.cuisine,
            address = excluded.address, lat = excluded.lat, lng = excluded.lng,
            last_seen_at = now()
    `;

    const rows = (await sql`
      insert into group_favorites (group_id, place_id, added_by_user_id, note)
      values (${groupId}, ${placeId}, ${user.id}, ${note ?? null})
      on conflict (group_id, place_id) do nothing
      returning created_at
    `) as Array<{ created_at: string }>;

    if (rows.length === 0) {
      throw new ApiException("already_exists", "Bu mekan gruba zaten eklenmiş.", 409);
    }

    const item: GroupFavoriteDto = {
      placeId,
      name: name ?? null,
      cuisine: cuisine ?? null,
      address: address ?? null,
      lat,
      lng,
      note: note ?? null,
      addedByName: user.displayName,
      createdAt: new Date(rows[0].created_at).toISOString(),
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
