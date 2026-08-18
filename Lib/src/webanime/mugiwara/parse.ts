import { MUGIWARA_API_HEADERS } from "../shared/headers.js";
import { fetchText } from "../../shared/fetch.js";

export const MUGIWARA_BASE_URL = "https://www.mugiwara-no-streaming.com";

export const MUGIWARA_IMAGES_BASE =
  "https://raw.githubusercontent.com/NOUSSS/mugiwara-no-streaming-images/main/Animes";

interface MugiwaraSeasonEntry {
  id: string;
  name: string;
  lang?: Record<string, string[][]>;
}

interface MugiwaraAnimeServer {
  slug: string;
  anime: string;
  synopsis?: string;
  type?: string;
  category?: string[];
  themes?: string[];
  adult?: boolean;
  airing?: boolean;
  options?: {
    affiche?: string;
    saisons?: MugiwaraSeasonEntry[];
    kai?: MugiwaraSeasonEntry[];
  };
}

export interface MugiwaraSeasonInfo {
  id: string;
  name: string;
  path: string;
  languages: string[];
  providersPerLang: Record<string, number>;
  episodesPerProvider: Record<string, number>;
  url: string;
}

export interface MugiwaraEpisodeName {
  number: number;
  title: string;
}

function unescapeRscJson(slice: string): string {
  return slice.replace(/\\"/g, '"').replace(/\\n/g, "\n");
}

function extractJsonObject(html: string, startIdx: number): string {
  let objStart = startIdx;
  while (objStart > 0 && html[objStart] !== "{") objStart--;

  const slice = html.slice(objStart);
  let depth = 0;

  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "{" && (i === 0 || slice[i - 1] !== "\\")) depth++;
    else if (slice[i] === "}" && slice[i - 1] !== "\\") {
      depth--;
      if (depth === 0) return slice.slice(0, i + 1);
    }
  }

  throw new Error("Could not extract JSON object from page");
}

export function parseAnimeServer(html: string, slug: string): MugiwaraAnimeServer {
  const marker = `\\"slug\\":\\"${slug}\\"`;
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error(`Anime slug not found in page: ${slug}`);

  const raw = extractJsonObject(html, idx);
  return JSON.parse(unescapeRscJson(raw)) as MugiwaraAnimeServer;
}

export function parseEpisodeNames(html: string): MugiwaraEpisodeName[] {
  const episodes: MugiwaraEpisodeName[] = [];
  const re = /\\"name\\":\\"([^\\]+)\\",\\"index\\":(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    episodes.push({ number: Number(match[2]), title: match[1] });
  }

  return episodes;
}

export function seasonUrlPath(seasonId: string): string {
  if (seasonId === "kai") return "kai";
  return `saison${seasonId}`;
}

export function resolveEmbedUrl(embedUrl: string): string {
  const match = embedUrl.match(/\/embed-[a-zA-Z0-9]+\.html/);
  if (!match) return embedUrl;

  const embedPath = match[0];

  if (/vidmoly\./i.test(embedUrl)) {
    return `https://ansembed.net${embedPath}`;
  }

  return embedUrl;
}

export function detectHost(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("vidmoly") || lower.includes("ansembed")) return "vidmoly";
  if (lower.includes("sibnet")) return "sibnet";
  if (lower.includes("sendvid")) return "sendvid";
  if (lower.includes("filemoon")) return "filemoon";
  if (lower.includes("oneupload")) return "oneupload";
  if (lower.includes("voe.")) return "voe";
  if (lower.includes("mail.ru") || lower.includes("ok.ru")) return "okru";
  return "unknown";
}

export function normalizeLang(lang: string | null | undefined): string {
  return String(lang || "").trim().toLowerCase();
}

export function coverImageUrl(slug: string, affiche?: string): string {
  const file = affiche || "Affiche.jpg";
  return `${MUGIWARA_IMAGES_BASE}/${slug}/${file}`;
}

export function findSeason(animeServer: MugiwaraAnimeServer, seasonId: string): MugiwaraSeasonEntry | null {
  const options = animeServer.options || {};
  const wanted = String(seasonId);

  if (wanted === "kai") {
    const kai = options.kai || [];
    return kai.find((entry) => entry.id === "kai") || kai[0] || null;
  }

  return (options.saisons || []).find((entry) => entry.id === wanted) || null;
}

export function listSeasonEntries(animeServer: MugiwaraAnimeServer): MugiwaraSeasonInfo[] {
  const options = animeServer.options || {};
  const seasons = (options.saisons || []).map((season) => ({
    id: season.id,
    name: season.name,
    path: seasonUrlPath(season.id),
    languages: Object.keys(season.lang || {}),
    providersPerLang: Object.fromEntries(
      Object.entries(season.lang || {}).map(([lang, providers]) => [lang, providers.length]),
    ),
    episodesPerProvider: Object.fromEntries(
      Object.entries(season.lang || {}).map(([lang, providers]) => [
        lang,
        providers[0]?.length || 0,
      ]),
    ),
    url: `${MUGIWARA_BASE_URL}/catalogue/${animeServer.slug}/episodes/${seasonUrlPath(season.id)}`,
  }));

  const kai = (options.kai || []).map((entry) => ({
    id: entry.id,
    name: entry.name,
    path: "kai",
    languages: Object.keys(entry.lang || {}),
    providersPerLang: Object.fromEntries(
      Object.entries(entry.lang || {}).map(([lang, providers]) => [lang, providers.length]),
    ),
    episodesPerProvider: Object.fromEntries(
      Object.entries(entry.lang || {}).map(([lang, providers]) => [
        lang,
        providers[0]?.length || 0,
      ]),
    ),
    url: `${MUGIWARA_BASE_URL}/catalogue/${animeServer.slug}/episodes/kai`,
  }));

  return [...seasons, ...kai];
}

export function collectLanguages(animeServer: MugiwaraAnimeServer): string[] {
  const langs = new Set<string>();

  for (const entry of listSeasonEntries(animeServer)) {
    for (const lang of entry.languages) langs.add(normalizeLang(lang).toUpperCase());
  }

  return [...langs].sort();
}

async function fetchPage(path: string): Promise<string> {
  return fetchText(`${MUGIWARA_BASE_URL}${path}`, { headers: MUGIWARA_API_HEADERS });
}

export async function fetchAnimeServer(slug: string): Promise<MugiwaraAnimeServer> {
  const html = await fetchPage(`/catalogue/${slug}`);
  return parseAnimeServer(html, slug);
}

export async function fetchEpisodeNames(slug: string, seasonId: string): Promise<MugiwaraEpisodeName[]> {
  const html = await fetchPage(`/catalogue/${slug}/episodes/${seasonUrlPath(seasonId)}`);
  return parseEpisodeNames(html);
}
