export interface WikipediaRef {
  lang: string;
  title: string;
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function wikimediaCommonsUrl(filename: string, width = 320): string {
  const file = filename.replace(/^File:/i, "").trim();
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

/** Parses OSM wikipedia tag, e.g. "tr:Anadolu Üniversitesi". */
export function parseWikipediaTag(tag: string | undefined): WikipediaRef | null {
  if (!tag?.trim()) return null;
  const idx = tag.indexOf(":");
  if (idx <= 0) return null;
  const lang = tag.slice(0, idx).trim().toLowerCase();
  const title = tag.slice(idx + 1).trim();
  if (!lang || !title) return null;
  return { lang, title };
}

/** Resolves a photo URL from common OSM image tags. */
export function resolvePhotoFromOsmTags(
  tags: Record<string, string>,
): string | null {
  for (const key of ["image", "photo", "logo"] as const) {
    const value = tags[key]?.trim();
    if (value && isSafeHttpUrl(value)) return value;
  }

  const commons = tags.wikimedia_commons?.trim();
  if (commons) return wikimediaCommonsUrl(commons);

  return null;
}

interface WikipediaQueryResponse {
  query?: {
    pages?: Record<
      string,
      { thumbnail?: { source?: string }; pageimage?: string }
    >;
  };
}

/** Fetches a Wikipedia lead-image thumbnail for a page title. */
export async function fetchWikipediaThumbnail(
  ref: WikipediaRef,
  width = 320,
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: ref.title,
    prop: "pageimages",
    format: "json",
    pithumbsize: String(width),
  });

  const res = await fetch(
    `https://${ref.lang}.wikipedia.org/w/api.php?${params}`,
    {
      headers: { "User-Agent": "piton-restoran-oneri/1.0" },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 86_400 },
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as WikipediaQueryResponse;
  const page = Object.values(data.query?.pages ?? {})[0];
  const source = page?.thumbnail?.source;
  return source && isSafeHttpUrl(source) ? source : null;
}
