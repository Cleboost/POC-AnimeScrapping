import {
  collectLanguages,
  coverImageUrl,
  fetchAnimeServer,
  fetchEpisodeNames,
  listSeasonEntries,
  MUGIWARA_BASE_URL,
  type MugiwaraEpisodeName,
  type MugiwaraSeasonInfo,
} from "./parse.js";

export interface MugiwaraAnimeDetails {
  slug: string;
  title: string;
  synopsis?: string;
  type?: string;
  categories: string[];
  themes: string[];
  adult?: boolean;
  airing?: boolean;
  coverImage: string;
  url: string;
  languages: string[];
  seasons: MugiwaraSeasonInfo[];
  episodes: MugiwaraEpisodeName[];
}

export async function getAnimeDetails(slug: string, seasonId?: string | null): Promise<MugiwaraAnimeDetails> {
  const animeServer = await fetchAnimeServer(slug);
  const seasons = listSeasonEntries(animeServer);

  let episodes: MugiwaraEpisodeName[] = [];
  if (seasonId) {
    episodes = await fetchEpisodeNames(slug, seasonId);
  }

  return {
    slug: animeServer.slug,
    title: animeServer.anime,
    synopsis: animeServer.synopsis,
    type: animeServer.type,
    categories: animeServer.category || [],
    themes: animeServer.themes || [],
    adult: animeServer.adult,
    airing: animeServer.airing,
    coverImage: coverImageUrl(animeServer.slug, animeServer.options?.affiche),
    url: `${MUGIWARA_BASE_URL}/catalogue/${animeServer.slug}`,
    languages: collectLanguages(animeServer),
    seasons,
    episodes,
  };
}

export async function getEpisodeByNumber(
  slug: string,
  seasonId: string,
  episodeNumber: number,
): Promise<{ anime: MugiwaraAnimeDetails; episode: MugiwaraEpisodeName }> {
  const details = await getAnimeDetails(slug, seasonId);
  const episode = details.episodes.find((ep) => ep.number === episodeNumber);

  if (!episode) {
    throw new Error(`Episode ${episodeNumber} not found for ${slug} season ${seasonId}`);
  }

  return { anime: details, episode };
}
