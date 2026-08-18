import type { InternalRef, InternalSearchHit, EmbedSource, WebAnimeAdapter } from "../types.js";
import type { WatchOptions } from "../../types.js";
import { searchMugiwara } from "./search.js";
import { getEpisodeSourcesByNumber } from "./sources.js";
import { seasonUrlPath } from "./parse.js";

function isMugiwaraRef(ref: InternalRef): ref is InternalRef & { platform: "mugiwara"; slug: string } {
  return ref.platform === "mugiwara";
}

function resolveLanguage(preferred: string): string {
  const normalized = preferred.toLowerCase();
  if (normalized === "vostfr") return "vostfr";
  if (normalized === "vf") return "vf";
  return normalized;
}

export const mugiwaraAdapter: WebAnimeAdapter = {
  platform: "mugiwara",

  async search(query: string): Promise<InternalSearchHit[]> {
    const results = await searchMugiwara(query);
    return results.map((r) => ({
      title: r.title,
      subtitle: r.synopsis ? r.synopsis.slice(0, 120) : undefined,
      poster: r.coverImage,
      format: r.type,
      ref: { platform: "mugiwara", slug: r.slug },
    }));
  },

  async getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]> {
    if (!isMugiwaraRef(ref)) {
      throw new Error("Invalid ref for mugiwara adapter");
    }

    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    const language = resolveLanguage(options.lang ?? "vostfr");
    const seasonId = String(season);

    const { sources } = await getEpisodeSourcesByNumber(
      ref.slug,
      seasonId,
      episode,
      language,
    );

    if (sources.length === 0) {
      throw new Error(`No providers found for episode S${season}E${episode}`);
    }

    const parentPageUrl = `https://www.mugiwara-no-streaming.com/catalogue/${ref.slug}/episodes/${seasonUrlPath(seasonId)}`;

    return sources.map((source) => ({
      provider: source.host,
      embedUrl: source.resolvedEmbedUrl,
      parentPageUrl,
    }));
  },
};
