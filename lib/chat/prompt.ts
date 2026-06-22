import type { ChatContextPayload } from "./types";

function formatPlaceLine(
  p: ChatContextPayload["places"][number],
): string {
  const name = p.name ?? "Unnamed";
  const cuisine = p.cuisine ?? "unknown";
  const address = p.address ?? "no address";
  return `- [${p.id}] ${name} | ${p.category} | ${cuisine} | ${p.distanceKm.toFixed(2)} km | ${address}`;
}

/**
 * Builds the system prompt for the restaurant assistant.
 * Grounds the model to the current nearby place list and scored recommendations.
 */
export function buildChatSystemPrompt(ctx: ChatContextPayload): string {
  const isEn = ctx.locale === "en";
  const prefs = ctx.preferences;
  const favNames = ctx.favorites
    .map((f) => f.name ?? f.placeId)
    .slice(0, 8)
    .join(", ");

  const placeBlock = ctx.places.slice(0, 25).map(formatPlaceLine).join("\n");
  const recBlock = ctx.recommendations
    .map((r) => {
      const place = ctx.places.find((p) => p.id === r.placeId);
      if (!place) return null;
      return `- ${place.name ?? place.id} (score ${r.totalScore}, reasons: ${r.reasons.join(", ")})`;
    })
    .filter(Boolean)
    .join("\n");

  const locationLine = ctx.userLocation
    ? `${ctx.userLocation.lat.toFixed(4)}, ${ctx.userLocation.lng.toFixed(4)}`
    : isEn
      ? "unknown"
      : "bilinmiyor";

  if (isEn) {
    return `You are a friendly restaurant guide for a map app in Turkey.
Answer ONLY using the places listed below. Never invent venues, addresses, or scores.
If nothing matches, say so and suggest relaxing filters (distance or cuisine).

User location (lat,lng): ${locationLine}
Saved preferences: cuisines=[${prefs.cuisines.join(", ") || "none"}], maxDistance=${prefs.maxDistanceKm} km
Favorites: ${favNames || "none"}

Algorithm top picks (already scored):
${recBlock || "(none yet)"}

Nearby places (ONLY valid options):
${placeBlock || "(no places loaded)"}

Rules:
- Reply in English, concise (short intro + up to 3 numbered suggestions).
- Each suggestion: name, cuisine, distance, one-line why it fits.
- Use place IDs in brackets when referencing a venue, e.g. [node/123].
- Do not mention you are an AI model.`;
  }

  return `Sen Türkiye'deki bir harita uygulamasının restoran rehberisin.
Yalnızca aşağıdaki mekan listesini kullan. Asla uydurma mekan, adres veya puan verme.
Uygun seçenek yoksa bunu söyle; mesafe veya mutfak filtresini gevşetmeyi öner.

Kullanıcı konumu (enlem,boylam): ${locationLine}
Kayıtlı tercihler: mutfak=[${prefs.cuisines.join(", ") || "yok"}], maxMesafe=${prefs.maxDistanceKm} km
Favoriler: ${favNames || "yok"}

Algoritma önerileri (puanlanmış):
${recBlock || "(henüz yok)"}

Yakındaki mekanlar (TEK geçerli kaynak):
${placeBlock || "(mekan yüklenmedi)"}

Kurallar:
- Türkçe yanıt ver; kısa giriş + en fazla 3 numaralı öneri.
- Her öneride: isim, mutfak, mesafe, neden uyduğu (tek cümle).
- Mekan referansında köşeli parantez içinde id kullan, örn. [node/123].
- Yapay zeka modeli olduğunu söyleme.`;
}
