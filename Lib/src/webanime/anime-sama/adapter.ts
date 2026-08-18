import type { InternalRef, InternalSearchHit, EmbedSource, WebAnimeAdapter } from "../types.js";
import type { WatchOptions } from "../../types.js";
import { searchAnimeSama } from "./search.js";
import { getCatalog, resolveSeasonUrl, findSeason } from "./catalog.js";
import { getAvailableLanguages, pickLanguageUrl } from "./languages.js";
import { getEpisodeProviders } from "./episodes.js";

function isAnimeSamaRef(ref: InternalRef): ref is InternalRef & { platform: "anime-sama"; catalogUrl: string } {
  return ref.platform === "anime-sama";
}

export const animeSamaAdapter: WebAnimeAdapter = {
  platform: "anime-sama",

  async search(query: string): Promise<InternalSearchHit[]> {
    const results = await searchAnimeSama(query);
    return results.map((r) => ({
      title: r.title,
      subtitle: r.sub || undefined,
      poster: r.img,
      ref: { platform: "anime-sama", catalogUrl: r.url },
    }));
  },

  async getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]> {
    if (!isAnimeSamaRef(ref)) {
      throw new Error("Invalid ref for anime-sama adapter");
    }

    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    const preferredLang = (options.lang ?? "vostfr").toLowerCase();

    const seasons = await getCatalog(ref.catalogUrl);
    const seasonEntry = findSeason(seasons, season);
    if (!seasonEntry) {
      throw new Error(`Season ${season} not found`);
    }

    let seasonUrl = resolveSeasonUrl(ref.catalogUrl, seasonEntry.url);

    if (!seasonUrl.includes("vostfr") && !seasonUrl.includes("vf")) {
      const langs = await getAvailableLanguages(seasonUrl);
      seasonUrl = pickLanguageUrl(seasonUrl, preferredLang, langs);
    }

    const providers = await getEpisodeProviders(seasonUrl);
    if (providers.length === 0) {
      throw new Error("No episode providers found");
    }

    const embeds: EmbedSource[] = [];
    for (const provider of providers) {
      if (episode < 1 || episode > provider.episodes.length) continue;
      const embedUrl = provider.episodes[episode - 1];
      embeds.push({
        provider: provider.provider,
        embedUrl,
      });
    }

    if (embeds.length === 0) {
      throw new Error(`Episode ${episode} not found`);
    }

    return embeds;
  },
};
