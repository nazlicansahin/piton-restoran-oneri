import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { createGroupSchema } from "@/lib/validation";
import type { GroupListItemDto, GroupRole } from "@/lib/types";

interface GroupListRow {
  id: string;
  name: string;
  description: string | null;
  role: GroupRole;
  member_count: string | number;
  created_at: string;
}

export async function GET(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);

    const rows = (await sql`
      select g.id, g.name, g.description, gm.role, g.created_at,
             (select count(*) from group_members m where m.group_id = g.id) as member_count
      from groups g
      join group_members gm on gm.group_id = g.id
      where gm.user_id = ${user.id}
      order by g.created_at desc
    `) as GroupListRow[];

    const items: GroupListItemDto[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      role: r.role,
      memberCount: Number(r.member_count),
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);

    const body = createGroupSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) {
      throw new ApiException("invalid_body", "Grup adı 3-80 karakter olmalı.", 400, {
        fieldErrors: body.error.flatten().fieldErrors,
      });
    }

    const { name, description } = body.data;
    const groupId = crypto.randomUUID();

    // Create group + owner membership atomically.
    const [groupRows] = await sql.transaction((txn) => [
      txn`
        insert into groups (id, name, description, owner_user_id)
        values (${groupId}, ${name}, ${description ?? null}, ${user.id})
        returning id, name, description, created_at
      `,
      txn`
        insert into group_members (group_id, user_id, role)
        values (${groupId}, ${user.id}, 'owner')
      `,
    ]);

    const g = (groupRows as Array<{
      id: string;
      name: string;
      description: string | null;
      created_at: string;
    }>)[0];

    const item: GroupListItemDto = {
      id: g.id,
      name: g.name,
      description: g.description,
      role: "owner",
      memberCount: 1,
      createdAt: new Date(g.created_at).toISOString(),
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
