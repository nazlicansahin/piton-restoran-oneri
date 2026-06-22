import { describe, expect, it } from "vitest";
import {
  parseWikipediaTag,
  resolvePhotoFromOsmTags,
  wikimediaCommonsUrl,
} from "./place-photo";

describe("place-photo", () => {
  it("builds wikimedia commons urls", () => {
    expect(wikimediaCommonsUrl("File:Coffee.jpg", 320)).toContain(
      "Special:FilePath",
    );
    expect(wikimediaCommonsUrl("Coffee.jpg", 320)).toContain("Coffee.jpg");
  });

  it("parses wikipedia tags", () => {
    expect(parseWikipediaTag("tr:Anadolu Üniversitesi")).toEqual({
      lang: "tr",
      title: "Anadolu Üniversitesi",
    });
    expect(parseWikipediaTag("invalid")).toBeNull();
  });

  it("resolves direct image urls and commons files", () => {
    expect(
      resolvePhotoFromOsmTags({
        image: "https://example.com/photo.jpg",
      }),
    ).toBe("https://example.com/photo.jpg");

    expect(
      resolvePhotoFromOsmTags({
        wikimedia_commons: "File:Restaurant.jpg",
      }),
    ).toContain("Restaurant.jpg");

    expect(resolvePhotoFromOsmTags({ name: "Test" })).toBeNull();
  });
});
