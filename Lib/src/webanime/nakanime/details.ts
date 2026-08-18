import { nakanimeApi } from "./api.js";
import { pickTitle, type NakanimeTitle } from "./search.js";

interface NakanimeSeason {
  id: number;
  number: number;
}

interface NakanimeEpisodeSource {
  language?: string;
}

interface NakanimeEpisode {
  id: number;
  number: number;
  title?: string;
  titleFr?: string;
  isFiller?: boolean;
  seasonId?: number;
  sources?: NakanimeEpisodeSource[];
}

interface NakanimeAnimeResponse {
  id: number;
  slug: string;
  title: string | NakanimeTitle;
  description?: string;
  format?: string;
  status?: string;
  episodes?: number;
  averageScore?: number;
  coverImage?: {
    extraLarge?: string;
    large?: string;
  };
  seasons?: NakanimeSeason[];
  languages?: Record<string, string>;
  episodesList?: NakanimeEpisode[];
}

export interface NakanimeEpisodeItem {
  id: number;
  number: number;
  title: string;
  isFiller?: boolean;
  seasonId?: number;
  seasonNumber: number;
  url: string;
}

export interface NakanimeAnimeDetails {
  id: number;
  slug: string;
  title: string;
  description?: string;
  format?: string;
  status?: string;
  episodesCount?: number;
  averageScore?: number;
  coverImage?: string;
  seasons: NakanimeSeason[];
  languages: string[];
  episodes: NakanimeEpisodeItem[];
}

function normalizeLang(lang: string | undefined): string {
  return String(lang || "").trim().toUpperCase();
}

function collectLanguages(anime: NakanimeAnimeResponse): string[] {
  const langs = new Set<string>();

  for (const episode of anime.episodesList || []) {
    for (const source of episode.sources || []) {
      if (source.language) langs.add(normalizeLang(source.language));
    }
  }

  if (langs.size === 0) {
    for (const value of Object.values(anime.languages || {})) {
      if (value) langs.add(normalizeLang(value));
    }
  }

  return [...langs].sort();
}

export async function getAnimeDetails(animeRef: number | string): Promise<NakanimeAnimeDetails> {
  const path = `/api/anime/${animeRef}`;
  const anime = await nakanimeApi<NakanimeAnimeResponse>(path);
  const seasons = anime.seasons || [];

  const episodes = (anime.episodesList || []).map((episode) => {
    const seasonNumber = seasons.find((s) => s.id === episode.seasonId)?.number || 1;
    return {
      id: episode.id,
      number: episode.number,
      title: episode.titleFr || episode.title || `Episode ${episode.number}`,
      isFiller: episode.isFiller,
      seasonId: episode.seasonId,
      seasonNumber,
      url: `https://nakanime.tv/anime/${anime.id}/season/${seasonNumber}/episode/${episode.number}`,
    };
  });

  return {
    id: anime.id,
    slug: anime.slug,
    title: pickTitle(anime.title),
    description: anime.description,
    format: anime.format,
    status: anime.status,
    episodesCount: anime.episodes,
    averageScore: anime.averageScore,
    coverImage: anime.coverImage?.extraLarge || anime.coverImage?.large,
    seasons,
    languages: collectLanguages(anime),
    episodes,
  };
}

export async function getEpisodeByNumber(
  animeRef: number | string,
  seasonNumber: number,
  episodeNumber: number,
): Promise<{ anime: NakanimeAnimeDetails; episode: NakanimeEpisodeItem }> {
  const details = await getAnimeDetails(animeRef);
  const episode = details.episodes.find(
    (ep) => ep.seasonNumber === seasonNumber && ep.number === episodeNumber,
  );

  if (!episode) {
    throw new Error(`Episode S${seasonNumber}E${episodeNumber} not found for anime ${animeRef}`);
  }

  return { anime: details, episode };
}
