import { fetchText } from "../../shared/fetch.js";

export interface SeasonEntry {
  name: string;
  url: string;
}

export async function getCatalog(catalogUrl: string): Promise<SeasonEntry[]> {
  const html = await fetchText(catalogUrl);
  const seasons: SeasonEntry[] = [];
  const animeRegex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\)/g;

  let match: RegExpExecArray | null;
  while ((match = animeRegex.exec(html)) !== null) {
    if (match[1] !== "nom" && match[2] !== "url") {
      seasons.push({ name: match[1], url: match[2] });
    }
  }

  return seasons;
}

export function resolveSeasonUrl(catalogUrl: string, relativeUrl: string): string {
  if (relativeUrl.startsWith("http")) return relativeUrl;
  const base = catalogUrl.endsWith("/") ? catalogUrl : catalogUrl + "/";
  return relativeUrl.startsWith("/")
    ? `https://anime-sama.to${relativeUrl}`
    : base + relativeUrl;
}

export function findSeason(seasons: SeasonEntry[], seasonNumber: number): SeasonEntry | undefined {
  const n = seasonNumber;
  const patterns = [
    `saison ${n}`,
    `saison 0${n}`,
    `season ${n}`,
    `saga ${n}`,
  ];

  const byName = seasons.find((s) => {
    const lower = s.name.toLowerCase();
    return patterns.some((p) => lower.includes(p));
  });
  if (byName) return byName;

  const urlPatterns = [`saison${n}/`, `saison0${n}/`, `saison${n}`, `saison0${n}`];
  const byUrl = seasons.find((s) => {
    const lower = s.url.toLowerCase();
    return urlPatterns.some((p) => lower.includes(p));
  });
  if (byUrl) return byUrl;

  if (n >= 1 && n <= seasons.length) {
    return seasons[n - 1];
  }

  return undefined;
}
