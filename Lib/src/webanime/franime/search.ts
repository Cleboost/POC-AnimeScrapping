import { fetchJson } from "../../shared/fetch.js";
import { FRANIME_API_HEADERS } from "../shared/headers.js";

interface FranimeAnimeListItem {
  id: string;
  titleO: string;
  titles?: {
    en?: string;
    en_jp?: string;
    ja_jp?: string;
  };
  affiche_small?: string;
  affiche?: string;
  format?: string;
  status?: string;
  note?: number;
}

export interface FranimeSearchItem {
  id: string;
  title: string;
  titleO: string;
  affiche?: string;
  format?: string;
  status?: string;
  note?: number;
}

export async function searchFranime(query: string): Promise<FranimeSearchItem[]> {
  const animes = await fetchJson<FranimeAnimeListItem[]>(
    "https://api.franime.fr/api/animes",
    { headers: FRANIME_API_HEADERS },
  );

  const q = query.toLowerCase();
  return animes
    .filter((a) => {
      const titles = [a.titleO, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp];
      return titles.some((t) => t?.toLowerCase().includes(q));
    })
    .map((a) => ({
      id: a.id,
      title: a.titles?.en || a.titleO,
      titleO: a.titleO,
      affiche: a.affiche_small || a.affiche,
      format: a.format,
      status: a.status,
      note: a.note,
    }));
}
