import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { resolveFavoriteCity } from "@/lib/favorite-city";
import { makeRequestId, toErrorResponse } from "@/lib/http";
import type { FavoriteDto } from "@/lib/types";

interface FavoriteRow {
  place_id: string;
  name: string | null;
  cuisine: string | null;
  address: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export async function GET(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);

    const rows = (await sql`
      select f.place_id, p.name, p.cuisine, p.address, p.lat, p.lng, f.created_at
      from favorites f
      join places p on p.id = f.place_id
      where f.user_id = ${user.id}
      order by f.created_at desc
    `) as FavoriteRow[];

    const cityCache = new Map<string, string | null>();
    const items: FavoriteDto[] = await Promise.all(
      rows.map(async (r) => ({
        placeId: r.place_id,
        name: r.name,
        cuisine: r.cuisine,
        address: r.address,
        city: await resolveFavoriteCity(
          { address: r.address, lat: r.lat, lng: r.lng },
          cityCache,
        ),
        lat: r.lat,
        lng: r.lng,
        createdAt: new Date(r.created_at).toISOString(),
      })),
    );

    return NextResponse.json({ items });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
