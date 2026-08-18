import { headOk } from "../../shared/fetch.js";
import { ANIME_SAMA_HEADERS } from "../shared/headers.js";

const POSSIBLE_LANGS = [
  "vostfr",
  "vf",
  "vf1",
  "vf2",
  "va",
  "vj",
  "vkr",
  "vcn",
  "var",
  "vqc",
];

export async function getAvailableLanguages(seasonUrl: string): Promise<{ lang: string; url: string }[]> {
  const baseUrl = seasonUrl.endsWith("/") ? seasonUrl.slice(0, -1) : seasonUrl;
  const parentUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/")) + "/";

  const probes = POSSIBLE_LANGS.map(async (lang) => {
    const testUrl = `${parentUrl}${lang}/`;
    const ok = await headOk(testUrl, ANIME_SAMA_HEADERS);
    if (ok) return { lang, url: testUrl };
    return null;
  });

  const results = await Promise.all(probes);
  return results.filter((r): r is { lang: string; url: string } => r !== null);
}

export function pickLanguageUrl(
  seasonUrl: string,
  preferredLang: string,
  available: { lang: string; url: string }[],
): string {
  const normalized = preferredLang.toLowerCase();
  const exact = available.find((l) => l.lang.toLowerCase() === normalized);
  if (exact) return exact.url;

  const vostfr = available.find((l) => l.lang.toLowerCase() === "vostfr");
  if (vostfr) return vostfr.url;

  const vf = available.find((l) => l.lang.toLowerCase() === "vf");
  if (vf) return vf.url;

  if (available.length > 0) return available[0].url;

  if (
    seasonUrl.includes("vostfr") ||
    seasonUrl.includes("vf") ||
    seasonUrl.endsWith("episodes.js")
  ) {
    return seasonUrl.endsWith("/") ? seasonUrl : seasonUrl + "/";
  }

  return seasonUrl;
}
