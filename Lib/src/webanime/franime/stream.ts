import { fetchText } from "../../shared/fetch.js";
import { FRANIME_API_HEADERS } from "../shared/headers.js";

export async function getStreamUrl(
  animeId: string,
  saisonIndex: number,
  episodeIndex: number,
  lang: string,
  lecteurIndex: number,
): Promise<string> {
  const url = `https://api.franime.fr/api/anime/${animeId}/${saisonIndex}/${episodeIndex}/${lang}/${lecteurIndex}`;
  const response = await fetch(url, { headers: FRANIME_API_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}
