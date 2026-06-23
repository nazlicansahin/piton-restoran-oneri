import { describe, expect, it } from "vitest";
import { normalizePlacesCacheKey } from "@/lib/places-cache";

describe("normalizePlacesCacheKey", () => {
  it("rounds coordinates and radius into stable buckets", () => {
    expect(
      normalizePlacesCacheKey(39.77674, 30.52061, 3000),
    ).toEqual({
      lat: 39.777,
      lng: 30.521,
      radiusM: 3000,
    });
  });

  it("maps nearby coordinates to the same cache bucket", () => {
    const a = normalizePlacesCacheKey(39.77671, 30.52059, 3050);
    const b = normalizePlacesCacheKey(39.77674, 30.52062, 3090);

    expect(a).toEqual(b);
  });

  it("keeps different radius buckets separate", () => {
    const near = normalizePlacesCacheKey(39.77, 30.52, 3000);
    const far = normalizePlacesCacheKey(39.77, 30.52, 5000);

    expect(near.radiusM).toBe(3000);
    expect(far.radiusM).toBe(5000);
  });
});
