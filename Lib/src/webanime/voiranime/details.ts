import { fetchText } from "../../shared/fetch.js";
import { VOIRANIME_HEADERS } from "../shared/headers.js";

export interface VoiranimeEpisode {
  index: number;
  title: string;
  url: string;
}

export interface VoiranimeDetails {
  title: string;
  url: string;
  episodes: VoiranimeEpisode[];
}

export async function getAnimeDetails(animeUrl: string): Promise<VoiranimeDetails> {
  const html = await fetchText(animeUrl, { headers: VOIRANIME_HEADERS });

  const titleMatch = html.match(/<div class="post-title">\s*<h1>\s*(.*?)\s*<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : "Unknown Anime";

  const episodeRegex =
    /<li class="wp-manga-chapter\s*[^"]*">\s*<a href="([^"]+)">\s*([\s\S]*?)\s*<\/a>/g;

  const episodes: { url: string; title: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = episodeRegex.exec(html)) !== null) {
    episodes.push({
      url: match[1],
      title: match[2].trim().replace(/\s+/g, " "),
    });
  }

  episodes.reverse();

  return {
    title,
    url: animeUrl,
    episodes: episodes.map((ep, index) => ({
      index: index + 1,
      title: ep.title,
      url: ep.url,
    })),
  };
}

export async function getEpisodePlayers(episodeUrl: string): Promise<{ name: string; embedUrl: string }[]> {
  const html = await fetchText(episodeUrl, { headers: VOIRANIME_HEADERS });

  const sourcesMatch = html.match(/var\s+thisChapterSources\s*=\s*({[^}]+});/);
  if (!sourcesMatch) return [];

  try {
    const sources = JSON.parse(sourcesMatch[1]) as Record<string, string>;
    const players: { name: string; embedUrl: string }[] = [];

    for (const [name, iframeHtml] of Object.entries(sources)) {
      const srcMatch = iframeHtml.match(/src="([^"]+)"/);
      if (srcMatch) {
        players.push({
          name,
          embedUrl: srcMatch[1].replace(/\\/g, ""),
        });
      }
    }

    return players;
  } catch {
    return [];
  }
}
