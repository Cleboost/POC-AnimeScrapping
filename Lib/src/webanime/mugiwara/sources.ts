import {
  detectHost,
  findSeason,
  fetchAnimeServer,
  fetchEpisodeNames,
  normalizeLang,
  resolveEmbedUrl,
} from "./parse.js";

export interface MugiwaraEpisodeSource {
  index: number;
  host: string;
  language: string;
  embedUrl: string;
  resolvedEmbedUrl: string;
}

function mapProvider(embedUrl: string, providerIndex: number, language: string): MugiwaraEpisodeSource {
  const resolvedEmbedUrl = resolveEmbedUrl(embedUrl);
  return {
    index: providerIndex,
    host: detectHost(embedUrl),
    language: normalizeLang(language).toUpperCase(),
    embedUrl: embedUrl.trim(),
    resolvedEmbedUrl,
  };
}

function pickLanguageUrls(
  season: { lang?: Record<string, string[][]> },
  language: string | null,
): { language: string | null; urlsByProvider: string[][] } {
  const langMap = season.lang || {};
  const wanted = normalizeLang(language);

  if (wanted && langMap[wanted]) return { language: wanted, urlsByProvider: langMap[wanted] };
  if (langMap.vostfr) return { language: "vostfr", urlsByProvider: langMap.vostfr };
  if (langMap.vf) return { language: "vf", urlsByProvider: langMap.vf };

  const [firstLang] = Object.keys(langMap);
  if (!firstLang) return { language: null, urlsByProvider: [] };

  return { language: firstLang, urlsByProvider: langMap[firstLang] };
}

export async function getEpisodeSources({
  slug,
  seasonId,
  episodeNumber,
  language = null,
}: {
  slug: string;
  seasonId: string;
  episodeNumber: number;
  language?: string | null;
}): Promise<{
  anime: { slug: string; title: string };
  season: { id: string; name: string };
  language: string | undefined;
  sources: MugiwaraEpisodeSource[];
}> {
  const animeServer = await fetchAnimeServer(slug);
  const season = findSeason(animeServer, seasonId);

  if (!season) throw new Error(`Season not found: ${seasonId}`);

  const { language: resolvedLang, urlsByProvider } = pickLanguageUrls(season, language);
  if (!urlsByProvider.length) throw new Error("No providers found for this season");

  const sources = urlsByProvider
    .map((urls, providerIndex) => {
      const embedUrl = urls[episodeNumber - 1];
      if (!embedUrl) return null;
      return mapProvider(embedUrl, providerIndex, resolvedLang ?? "");
    })
    .filter((source): source is MugiwaraEpisodeSource => source !== null);

  if (!sources.length) {
    throw new Error(`No provider URL for episode ${episodeNumber}`);
  }

  return {
    anime: {
      slug: animeServer.slug,
      title: animeServer.anime,
    },
    season: {
      id: season.id,
      name: season.name,
    },
    language: resolvedLang?.toUpperCase(),
    sources,
  };
}

export async function getEpisodeSourcesByNumber(
  slug: string,
  seasonId: string,
  episodeNumber: number,
  language: string | null = null,
): Promise<{
  anime: { slug: string; title: string };
  season: { id: string; name: string };
  episode: { number: number; title: string };
  language: string | undefined;
  sources: MugiwaraEpisodeSource[];
}> {
  const payload = await getEpisodeSources({
    slug,
    seasonId,
    episodeNumber,
    language,
  });

  let episodeTitle = `Episode ${episodeNumber}`;
  try {
    const names = await fetchEpisodeNames(slug, seasonId);
    const match = names.find((ep) => ep.number === episodeNumber);
    if (match) episodeTitle = match.title;
  } catch {
    // Episode names optional — catalogue URLs are enough
  }

  return {
    ...payload,
    episode: {
      number: episodeNumber,
      title: episodeTitle,
    },
  };
}
