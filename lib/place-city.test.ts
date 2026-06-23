import { describe, expect, it } from "vitest";
import { cityFromStoredPlace } from "@/lib/place-city";

describe("cityFromStoredPlace", () => {
  it("prefers stored city over address parsing", () => {
    expect(cityFromStoredPlace("Ankara", "Kızılay, İstanbul, Türkiye")).toBe(
      "Ankara",
    );
  });

  it("falls back to address when city is missing", () => {
    expect(cityFromStoredPlace(null, "Caddesi 12 Merkez Eskişehir")).toBe(
      "Eskişehir",
    );
  });

  it("returns null when neither source has a city", () => {
    expect(cityFromStoredPlace(null, null)).toBeNull();
  });
});
