import { describe, expect, it } from "vitest";
import {
  extractCityFromAddress,
  groupFavoritesByCity,
} from "@/lib/favorite-city";
import type { FavoriteDto } from "@/lib/types";

function favorite(
  overrides: Partial<FavoriteDto> & Pick<FavoriteDto, "placeId">,
): FavoriteDto {
  return {
    placeId: overrides.placeId,
    name: overrides.name ?? "Test",
    cuisine: overrides.cuisine ?? null,
    address: overrides.address ?? null,
    city: overrides.city ?? null,
    lat: overrides.lat ?? 39.77,
    lng: overrides.lng ?? 30.52,
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
  };
}

describe("extractCityFromAddress", () => {
  it("reads city from comma-separated addresses", () => {
    expect(
      extractCityFromAddress("Kızılay, Ankara, Türkiye"),
    ).toBe("Ankara");
  });

  it("reads city from OSM-style space-separated addresses", () => {
    expect(
      extractCityFromAddress("Atatürk Caddesi 12 Merkez Eskişehir"),
    ).toBe("Eskişehir");
  });

  it("returns null for empty or numeric-only tails", () => {
    expect(extractCityFromAddress(null)).toBeNull();
    expect(extractCityFromAddress("Caddesi 12 34")).toBeNull();
  });
});

describe("groupFavoritesByCity", () => {
  it("groups favorites by city and sorts cities alphabetically", () => {
    const groups = groupFavoritesByCity(
      [
        favorite({
          placeId: "1",
          city: "İstanbul",
          createdAt: "2026-01-02T00:00:00.000Z",
        }),
        favorite({
          placeId: "2",
          city: "Ankara",
          createdAt: "2026-01-03T00:00:00.000Z",
        }),
        favorite({
          placeId: "3",
          city: "İstanbul",
          createdAt: "2026-01-01T00:00:00.000Z",
        }),
      ],
      "Diğer",
    );

    expect(groups.map((g) => g.city)).toEqual(["Ankara", "İstanbul"]);
    expect(groups[1]?.items.map((item) => item.placeId)).toEqual(["1", "3"]);
  });

  it("puts unknown locations last", () => {
    const groups = groupFavoritesByCity(
      [
        favorite({ placeId: "1", city: null, address: null }),
        favorite({ placeId: "2", city: "Antalya" }),
      ],
      "Diğer",
    );

    expect(groups.map((g) => g.city)).toEqual(["Antalya", "Diğer"]);
  });
});
