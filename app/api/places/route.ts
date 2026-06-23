import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCachedNearbyPlaces,
  placesCacheControlHeader,
} from "@/lib/places-cache";
import type { ApiError } from "@/lib/types";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(20_000).default(1500),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");

  if (!latRaw || !lngRaw) {
    const error: ApiError = {
      code: "invalid_query",
      message: "lat and lng query parameters are required.",
    };
    return NextResponse.json(error, { status: 400 });
  }

  const parsed = querySchema.safeParse({
    lat: latRaw,
    lng: lngRaw,
    radius: searchParams.get("radius") ?? undefined,
  });

  if (!parsed.success) {
    const error: ApiError = {
      code: "invalid_query",
      message: "lat and lng are required and must be valid coordinates.",
      details: parsed.error.flatten().fieldErrors,
    };
    return NextResponse.json(error, { status: 400 });
  }

  const { lat, lng, radius } = parsed.data;

  try {
    const items = await getCachedNearbyPlaces(lat, lng, radius);
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": placesCacheControlHeader(),
        },
      },
    );
  } catch (err) {
    const error: ApiError = {
      code: "upstream_error",
      message: "Could not fetch nearby places from Overpass.",
    };
    console.error("places route error", err);
    return NextResponse.json(error, { status: 502 });
  }
}
