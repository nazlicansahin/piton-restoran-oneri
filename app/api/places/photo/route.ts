import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchWikipediaThumbnail,
  parseWikipediaTag,
} from "@/lib/place-photo";
import type { ApiError } from "@/lib/types";

const querySchema = z.object({
  wikipedia: z.string().min(3).max(200),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    wikipedia: searchParams.get("wikipedia"),
  });

  if (!parsed.success) {
    const error: ApiError = {
      code: "invalid_query",
      message: "wikipedia query parameter is required.",
    };
    return NextResponse.json(error, { status: 400 });
  }

  const ref = parseWikipediaTag(parsed.data.wikipedia);
  if (!ref) {
    return NextResponse.json({ url: null });
  }

  try {
    const url = await fetchWikipediaThumbnail(ref);
    return NextResponse.json(
      { url },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch {
    return NextResponse.json({ url: null });
  }
}
