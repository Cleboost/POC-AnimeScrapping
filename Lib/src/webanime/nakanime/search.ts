import { nakanimeApi } from "./api.js";

export interface NakanimeTitle {
  userPreferred?: string;
  english?: string;
  romaji?: string;
  native?: string;
}

interface NakanimeMedia {
  id: number;
  slug: string;
  title: string | NakanimeTitle;
  format?: string;
  status?: string;
  episodes?: number;
  seasonYear?: number;
  averageScore?: number;
  coverImage?: {
    medium?: string;
    large?: string;
  };
  languages?: string[];
  availableLanguages?: string[];
}

interface NakanimeSearchResponse {
  media?: NakanimeMedia[];
}

export interface NakanimeSearchItem {
  id: number;
  slug: string;
  title: string;
  format?: string;
  status?: string;
  episodes?: number;
  seasonYear?: number;
  averageScore?: number;
  coverImage?: string;
  languages: string[];
}

export function pickTitle(title: string | NakanimeTitle | undefined): string {
  if (!title) return "Unknown";
  if (typeof title === "string") return title;
  return title.userPreferred || title.english || title.romaji || title.native || "Unknown";
}

function mapAnime(media: NakanimeMedia): NakanimeSearchItem {
  return {
    id: media.id,
    slug: media.slug,
    title: pickTitle(media.title),
    format: media.format,
    status: media.status,
    episodes: media.episodes,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    coverImage: media.coverImage?.medium || media.coverImage?.large,
    languages: media.languages || media.availableLanguages || [],
  };
}

export async function searchNakanime(query: string): Promise<NakanimeSearchItem[]> {
  const data = await nakanimeApi<NakanimeSearchResponse>(
    `/api/anime?q=${encodeURIComponent(query)}`,
  );
  return (data.media || []).map(mapAnime);
}
