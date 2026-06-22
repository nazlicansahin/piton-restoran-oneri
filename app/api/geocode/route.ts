import { NextResponse } from "next/server";
import { z } from "zod";
import { geocodeQuery } from "@/lib/geocode";
import type { ApiError } from "@/lib/types";

const querySchema = z.object({
  q: z.string().trim().min(2).max(120),
  limit: z.coerce.number().min(1).max(8).default(5),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q"),
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    const error: ApiError = {
      code: "invalid_query",
      message: "Geçerli bir konum araması girin.",
    };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    const items = await geocodeQuery(parsed.data.q, parsed.data.limit);
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    const error: ApiError = {
      code: "upstream_error",
      message: "Konum araması şu an yapılamıyor.",
    };
    return NextResponse.json(error, { status: 502 });
  }
}
