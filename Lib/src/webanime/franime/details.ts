import { fetchJson } from "../../shared/fetch.js";
import { FRANIME_API_HEADERS } from "../shared/headers.js";

export interface FranimeLecteur {
  name?: string;
  lecteur?: string;
}

export interface FranimeEpisode {
  index: number;
  title: string;
  voLecteurs: FranimeLecteur[];
  vfLecteurs: FranimeLecteur[];
}

export interface FranimeSaison {
  index: number;
  title: string;
  episodes: FranimeEpisode[];
}

export interface FranimeDetails {
  id: string;
  title: string;
  titleO: string;
  saisons: FranimeSaison[];
}

interface ApiAnime {
  id: string;
  titleO: string;
  titles?: { en?: string };
  saisons: Array<{
    title: string;
    episodes: Array<{
      title: string;
      lang: {
        vo?: { lecteurs?: FranimeLecteur[] };
        vf?: { lecteurs?: FranimeLecteur[] };
      };
    }>;
  }>;
}

export async function getAnimeDetails(animeId: string): Promise<FranimeDetails> {
  const anime = await fetchJson<ApiAnime>(
    `https://api.franime.fr/api/anime-by-id/${animeId}`,
    { headers: FRANIME_API_HEADERS },
  );

  return {
    id: anime.id,
    title: anime.titles?.en || anime.titleO,
    titleO: anime.titleO,
    saisons: anime.saisons.map((saison, saisonIndex) => ({
      index: saisonIndex,
      title: saison.title,
      episodes: saison.episodes.map((ep, epIndex) => ({
        index: epIndex,
        title: ep.title,
        voLecteurs: ep.lang.vo?.lecteurs ?? [],
        vfLecteurs: ep.lang.vf?.lecteurs ?? [],
      })),
    })),
  };
}
