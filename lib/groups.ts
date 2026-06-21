import { sql } from "@/lib/db";
import { ApiException } from "@/lib/http";
import type { GroupRole } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertGroupId(groupId: string): string {
  if (!UUID_REGEX.test(groupId)) {
    throw new ApiException("invalid_group_id", "Geçersiz grup kimliği.", 400);
  }
  return groupId;
}

/**
 * Return the caller's role in a group, or null if they are not a member.
 */
export async function getMembershipRole(
  userId: string,
  groupId: string,
): Promise<GroupRole | null> {
  const rows = (await sql`
    select role from group_members
    where group_id = ${groupId} and user_id = ${userId}
  `) as Array<{ role: GroupRole }>;
  return rows[0]?.role ?? null;
}

/**
 * Ensure the user is a member (and optionally has one of the allowed roles).
 * Throws 403 when not permitted. Returns the resolved role.
 */
export async function requireMembership(
  userId: string,
  groupId: string,
  allowedRoles?: GroupRole[],
): Promise<GroupRole> {
  const role = await getMembershipRole(userId, groupId);
  if (!role) {
    throw new ApiException("forbidden", "Bu gruba erişiminiz yok.", 403);
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ApiException(
      "forbidden",
      "Bu işlem için yetkiniz yok.",
      403,
    );
  }
  return role;
}
