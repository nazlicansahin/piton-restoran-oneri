import { sql } from "@/lib/db";
import type { VerifiedUser } from "./verify-token";

export interface AppUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Map a verified Firebase user to the internal users row, creating it on
 * first sight. Profile fields are refreshed on each call.
 */
export async function getOrCreateUser(user: VerifiedUser): Promise<AppUser> {
  const rows = (await sql`
    insert into users (firebase_uid, email, display_name, photo_url)
    values (${user.firebaseUid}, ${user.email}, ${user.name}, ${user.picture})
    on conflict (firebase_uid) do update
      set email = excluded.email,
          display_name = excluded.display_name,
          photo_url = excluded.photo_url,
          updated_at = now()
    returning id, firebase_uid, email, display_name
  `) as Array<{
    id: string;
    firebase_uid: string;
    email: string | null;
    display_name: string | null;
  }>;

  const row = rows[0];
  return {
    id: row.id,
    firebaseUid: row.firebase_uid,
    email: row.email,
    displayName: row.display_name,
  };
}
