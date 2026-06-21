import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { ApiException, makeRequestId, toErrorResponse } from "@/lib/http";
import { assertGroupId, requireMembership } from "@/lib/groups";
import { inviteSchema } from "@/lib/validation";
import type { GroupInviteDto } from "@/lib/types";

interface RouteContext {
  params: { groupId: string };
}

const INVITE_TTL_DAYS = 7;

export async function POST(request: Request, { params }: RouteContext) {
  const requestId = makeRequestId();
  try {
    const user = await requireUser(request);
    const groupId = assertGroupId(params.groupId);
    await requireMembership(user.id, groupId, ["owner", "admin"]);

    const body = inviteSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) {
      throw new ApiException("invalid_body", "Geçerli bir e-posta girin.", 400, {
        fieldErrors: body.error.flatten().fieldErrors,
      });
    }

    const { email } = body.data;
    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Link to an existing user if the email already has an account.
    const invitedRows = (await sql`
      select id from users where lower(email) = ${email}
    `) as Array<{ id: string }>;
    const invitedUserId = invitedRows[0]?.id ?? null;

    let rows: Array<{
      id: string;
      email: string | null;
      status: string;
      token: string;
      expires_at: string;
      created_at: string;
    }>;
    try {
      rows = (await sql`
        insert into group_invites
          (group_id, invited_by_user_id, invited_user_id, email, token, expires_at)
        values
          (${groupId}, ${user.id}, ${invitedUserId}, ${email}, ${token}, ${expiresAt})
        returning id, email, status, token, expires_at, created_at
      `) as typeof rows;
    } catch {
      throw new ApiException(
        "invite_exists",
        "Bu e-posta için bekleyen bir davet zaten var.",
        409,
      );
    }

    const r = rows[0];
    const item: GroupInviteDto = {
      id: r.id,
      email: r.email,
      status: r.status,
      token: r.token,
      expiresAt: new Date(r.expires_at).toISOString(),
      createdAt: new Date(r.created_at).toISOString(),
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err, requestId);
  }
}
