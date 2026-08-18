import { MUGIWARA_API_HEADERS } from "../shared/headers.js";
import { fetchJson } from "../../shared/fetch.js";
import { coverImageUrl, MUGIWARA_BASE_URL } from "./parse.js";

interface MugiwaraSearchItem {
  anime: string;
  slug: string;
  synopsis?: string;
  type?: string;
  category?: string[];
  themes?: string[];
  matched?: string;
  affiche?: string;
}

interface MugiwaraSearchResponse {
  results?: MugiwaraSearchItem[];
}

export interface MugiwaraSearchResult {
  title: string;
  slug: string;
  synopsis?: string;
  type?: string;
  categories: string[];
  themes: string[];
  matched?: string;
  coverImage: string;
  url: string;
}

function mapSearchResult(item: MugiwaraSearchItem): MugiwaraSearchResult {
  return {
    title: item.anime,
    slug: item.slug,
    synopsis: item.synopsis,
    type: item.type,
    categories: item.category || [],
    themes: item.themes || [],
    matched: item.matched,
    coverImage: coverImageUrl(item.slug, item.affiche),
    url: `${MUGIWARA_BASE_URL}/catalogue/${item.slug}`,
  };
}

export async function searchMugiwara(query: string): Promise<MugiwaraSearchResult[]> {
  const data = await fetchJson<MugiwaraSearchResponse>(
    `${MUGIWARA_BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
    { headers: MUGIWARA_API_HEADERS },
  );
  return (data.results || []).map(mapSearchResult);
}
