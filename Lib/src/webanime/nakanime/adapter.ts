import type { InternalRef, InternalSearchHit, EmbedSource, WebAnimeAdapter } from "../types.js";
import type { WatchOptions } from "../../types.js";
import { searchNakanime } from "./search.js";
import { getEpisodeSourcesByNumber } from "./sources.js";

function isNakanimeRef(ref: InternalRef): ref is InternalRef & { platform: "nakanime"; animeId: number } {
  return ref.platform === "nakanime";
}

function resolveLanguage(preferred: string): string {
  const normalized = preferred.toLowerCase();
  if (normalized === "vostfr") return "VOSTFR";
  if (normalized === "vf") return "VF";
  if (normalized === "vo") return "VO";
  return preferred.toUpperCase();
}

export const nakanimeAdapter: WebAnimeAdapter = {
  platform: "nakanime",

  async search(query: string): Promise<InternalSearchHit[]> {
    const results = await searchNakanime(query);
    return results.map((r) => ({
      title: r.title,
      poster: r.coverImage,
      format: r.format,
      status: r.status,
      note: r.averageScore,
      ref: { platform: "nakanime", animeId: r.id },
    }));
  },

  async getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]> {
    if (!isNakanimeRef(ref)) {
      throw new Error("Invalid ref for nakanime adapter");
    }

    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    const language = resolveLanguage(options.lang ?? "vostfr");

    const { episode: ep, sources } = await getEpisodeSourcesByNumber(
      ref.animeId,
      season,
      episode,
      language,
    );

    if (sources.length === 0) {
      throw new Error(`No providers found for episode S${season}E${episode}`);
    }

    return sources.map((source) => ({
      provider: source.host,
      embedUrl: source.embedUrl,
      parentPageUrl: ep.url,
    }));
  },
};
