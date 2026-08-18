import { nakanimeApi } from "./api.js";
import { getEpisodeByNumber } from "./details.js";

interface NakanimeSourceResponse {
  id?: number;
  host: string;
  language?: string;
  url: string;
  episodeId?: number;
}

export interface NakanimeEpisodeSource {
  id?: number;
  host: string;
  language: string;
  embedUrl: string;
  episodeId?: number;
}

function normalizeLang(lang: string | undefined): string {
  return String(lang || "").trim().toUpperCase();
}

function mapSource(source: NakanimeSourceResponse): NakanimeEpisodeSource {
  return {
    id: source.id,
    host: source.host,
    language: normalizeLang(source.language),
    embedUrl: source.url,
    episodeId: source.episodeId,
  };
}

export async function getEpisodeSources({
  animeId,
  episodeId,
  language = null,
}: {
  animeId: number;
  episodeId: number;
  language?: string | null;
}): Promise<NakanimeEpisodeSource[]> {
  const sources = await nakanimeApi<NakanimeSourceResponse[]>("/api/sources/anime", {
    method: "POST",
    body: {
      anime_id: animeId,
      episode_id: episodeId,
    },
  });

  const mapped = (sources || []).map(mapSource);

  if (!language) return mapped;

  const wanted = normalizeLang(language);
  const filtered = mapped.filter((source) => source.language === wanted);
  return filtered.length ? filtered : mapped;
}

export async function getEpisodeSourcesByNumber(
  animeRef: number | string,
  seasonNumber: number,
  episodeNumber: number,
  language: string | null = null,
): Promise<{
  anime: Awaited<ReturnType<typeof getEpisodeByNumber>>["anime"];
  episode: Awaited<ReturnType<typeof getEpisodeByNumber>>["episode"];
  sources: NakanimeEpisodeSource[];
}> {
  const { anime, episode } = await getEpisodeByNumber(animeRef, seasonNumber, episodeNumber);
  const sources = await getEpisodeSources({
    animeId: anime.id,
    episodeId: episode.id,
    language,
  });

  return { anime, episode, sources };
}
