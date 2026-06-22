import { describe, expect, it } from "vitest";
import { withDistancesFromCenter } from "@/lib/places-distance";
import type { Place } from "@/lib/types";

const basePlace: Place = {
  id: "node/1",
  name: "Test",
  cuisine: "pizza",
  address: null,
  lat: 39.78,
  lng: 30.53,
  category: "restaurant",
  distanceKm: 0.5,
};

describe("withDistancesFromCenter", () => {
  it("recomputes distances when the search center moves", () => {
    const nearCenter = withDistancesFromCenter(
      [basePlace],
      { lat: 39.7767, lng: 30.5206 },
    );
    const farCenter = withDistancesFromCenter(
      [basePlace],
      { lat: 39.9, lng: 30.7 },
    );

    expect(farCenter[0]!.distanceKm).toBeGreaterThan(nearCenter[0]!.distanceKm);
  });
});
