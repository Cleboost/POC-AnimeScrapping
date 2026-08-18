import type { InternalRef, InternalSearchHit, EmbedSource, WebAnimeAdapter } from "../types.js";
import type { WatchOptions } from "../../types.js";
import { searchFranime } from "./search.js";
import { getAnimeDetails } from "./details.js";
import { getStreamUrl } from "./stream.js";
import { decryptWatch2, providerNameFromWatch2Url } from "./watch2.js";
import { providerNameFromUrl } from "../../provider/index.js";

function isFranimeRef(ref: InternalRef): ref is InternalRef & { platform: "franime"; animeId: string } {
  return ref.platform === "franime";
}

function resolveLang(preferred: string, hasVo: boolean, hasVf: boolean): string {
  const normalized = preferred.toLowerCase();
  if (normalized === "vostfr" || normalized === "vo") {
    if (hasVo) return "vo";
    if (hasVf) return "vf";
  }
  if (normalized === "vf") {
    if (hasVf) return "vf";
    if (hasVo) return "vo";
  }
  if (hasVo) return "vo";
  if (hasVf) return "vf";
  throw new Error("No language available for episode");
}

export const franimeAdapter: WebAnimeAdapter = {
  platform: "franime",

  async search(query: string): Promise<InternalSearchHit[]> {
    const results = await searchFranime(query);
    return results.map((r) => ({
      title: r.title,
      titleOriginal: r.titleO,
      poster: r.affiche,
      format: r.format,
      status: r.status,
      note: r.note,
      ref: { platform: "franime", animeId: r.id },
    }));
  },

  async getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]> {
    if (!isFranimeRef(ref)) {
      throw new Error("Invalid ref for franime adapter");
    }

    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    const preferredLang = options.lang ?? "vostfr";

    const details = await getAnimeDetails(ref.animeId);
    const saisonIndex = season - 1;
    const episodeIndex = episode - 1;

    const saison = details.saisons[saisonIndex];
    if (!saison) {
      throw new Error(`Season ${season} not found`);
    }

    const ep = saison.episodes[episodeIndex];
    if (!ep) {
      throw new Error(`Episode ${episode} not found`);
    }

    const hasVo = ep.voLecteurs.length > 0;
    const hasVf = ep.vfLecteurs.length > 0;
    const lang = resolveLang(preferredLang, hasVo, hasVf);
    const lecteurs = lang === "vo" ? ep.voLecteurs : ep.vfLecteurs;

    const embeds: EmbedSource[] = [];

    for (let lecteurIndex = 0; lecteurIndex < lecteurs.length; lecteurIndex++) {
      const watch2Url = await getStreamUrl(
        ref.animeId,
        saisonIndex,
        episodeIndex,
        lang,
        lecteurIndex,
      );

      const providerUrl = decryptWatch2(watch2Url.trim());
      if (!providerUrl) continue;

      const lecteur = lecteurs[lecteurIndex];
      const provider =
        lecteur.name ||
        lecteur.lecteur ||
        providerNameFromWatch2Url(providerUrl) ||
        providerNameFromUrl(providerUrl);

      embeds.push({
        provider,
        embedUrl: providerUrl,
      });
    }

    if (embeds.length === 0) {
      throw new Error("No providers resolved for episode");
    }

    return embeds;
  },
};
