import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { assertGroupId, requireMembership } from "@/lib/groups";
import type { GroupDetailsDto, GroupMemberDto, GroupRole } from "@/lib/types";

interface RouteContext {
  params: { groupId: string };
}

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface MemberRow {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: GroupRole;
  joined_at: string;
}

export async function GET(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const groupId = assertGroupId(params.groupId);
    const role = await requireMembership(user.id, groupId);

    const groupRows = (await sql`
      select id, name, description, created_at from groups where id = ${groupId}
    `) as GroupRow[];
    const group = groupRows[0];
    if (!group) {
      throw new ApiException("not_found", "Grup bulunamadı.", 404);
    }

    const memberRows = (await sql`
      select gm.user_id, u.display_name, u.email, gm.role, gm.joined_at
      from group_members gm
      join users u on u.id = gm.user_id
      where gm.group_id = ${groupId}
      order by gm.joined_at asc
    `) as MemberRow[];

    const members: GroupMemberDto[] = memberRows.map((m) => ({
      userId: m.user_id,
      displayName: m.display_name,
      email: m.email,
      role: m.role,
      joinedAt: new Date(m.joined_at).toISOString(),
    }));

    const item: GroupDetailsDto = {
      id: group.id,
      name: group.name,
      description: group.description,
      role,
      members,
      createdAt: new Date(group.created_at).toISOString(),
    };

    return NextResponse.json({ item });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
