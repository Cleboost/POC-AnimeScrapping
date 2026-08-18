import type { InternalRef, InternalSearchHit, EmbedSource, WebAnimeAdapter } from "../types.js";
import type { WatchOptions } from "../../types.js";
import { searchVoiranime } from "./search.js";
import { getAnimeDetails, getEpisodePlayers } from "./details.js";

function isVoiranimeRef(ref: InternalRef): ref is InternalRef & { platform: "voiranime"; animeUrl: string } {
  return ref.platform === "voiranime";
}

export const voiranimeAdapter: WebAnimeAdapter = {
  platform: "voiranime",

  async search(query: string): Promise<InternalSearchHit[]> {
    const results = await searchVoiranime(query);
    return results.map((r) => ({
      title: r.title,
      subtitle: r.synopsis ? r.synopsis.slice(0, 120) : undefined,
      poster: r.affiche,
      ref: { platform: "voiranime", animeUrl: r.link },
    }));
  },

  async getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]> {
    if (!isVoiranimeRef(ref)) {
      throw new Error("Invalid ref for voiranime adapter");
    }

    const episode = options.episode ?? 1;
    const details = await getAnimeDetails(ref.animeUrl);

    const targetEp = details.episodes.find((e) => e.index === episode) ?? details.episodes[episode - 1];
    if (!targetEp) {
      throw new Error(`Episode ${episode} not found`);
    }

    const players = await getEpisodePlayers(targetEp.url);
    return players.map((p) => ({
      provider: p.name,
      embedUrl: p.embedUrl,
      parentPageUrl: targetEp.url,
    }));
  },
};
