import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { assertGroupId, requireMembership } from "@/lib/groups";
import { placeIdSchema } from "@/lib/validation";

interface RouteContext {
  params: { groupId: string; placeId: string[] };
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const groupId = assertGroupId(params.groupId);
    await requireMembership(user.id, groupId, ["owner", "admin"]);

    const placeId = placeIdSchema.safeParse(params.placeId.join("/"));
    if (!placeId.success) {
      throw new ApiException("invalid_place_id", "Geçersiz mekan kimliği.", 400);
    }

    const rows = (await sql`
      delete from group_favorites
      where group_id = ${groupId} and place_id = ${placeId.data}
      returning place_id
    `) as Array<{ place_id: string }>;

    if (rows.length === 0) {
      throw new ApiException("not_found", "Mekan grupta bulunamadı.", 404);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
