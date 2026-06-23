import { sql } from "@/lib/db";
import { resolvePlaceCity } from "@/lib/place-city";
import type { PlaceSnapshot } from "@/lib/validation";

export async function upsertPlaceSnapshot(
  placeId: string,
  snapshot: PlaceSnapshot,
): Promise<string | null> {
  const city = await resolvePlaceCity(
    snapshot.address ?? null,
    snapshot.lat,
    snapshot.lng,
  );

  await sql`
    insert into places (id, name, cuisine, address, city, lat, lng, last_seen_at)
    values (
      ${placeId},
      ${snapshot.name ?? null},
      ${snapshot.cuisine ?? null},
      ${snapshot.address ?? null},
      ${city},
      ${snapshot.lat},
      ${snapshot.lng},
      now()
    )
    on conflict (id) do update
      set name = excluded.name,
          cuisine = excluded.cuisine,
          address = excluded.address,
          city = coalesce(excluded.city, places.city),
          lat = excluded.lat,
          lng = excluded.lng,
          last_seen_at = now()
  `;

  return city;
}
