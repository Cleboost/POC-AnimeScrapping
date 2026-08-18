import type {
  AnimeOptions,
  Platform,
  ResolvedSource,
  SearchResponse,
  WatchOptions,
  WatchResponse,
} from "./types.js";
import { Session } from "./session.js";
import { searchAll, getAdapter } from "./webanime/index.js";
import { refererForPlatform } from "./webanime/shared/headers.js";
import { extractStream } from "./provider/index.js";
import { enrichHlsStream } from "./provider/m3u8/parser.js";
import { applyBestVariant, pickBestSource } from "./provider/m3u8/select.js";
import type { ProviderContext } from "./provider/types.js";
import { groupSearchHits, pickDisplayTitle } from "./grouping.js";
import type { EmbedSource } from "./webanime/types.js";
import { allPlatforms } from "./providers.js";

export class Anime {
  private session = new Session();
  private headless: boolean;
  private enabledPlatforms: Platform[];

  constructor(options: AnimeOptions = {}) {
    this.headless = options.headless ?? true;
    this.enabledPlatforms = options.providers ?? allPlatforms;
  }

  async search(query: string): Promise<SearchResponse> {
    const hits = await searchAll(query, this.enabledPlatforms);
    const groups = groupSearchHits(hits);

    const results = groups.map((group) => {
      const title = pickDisplayTitle(group);
      const platforms = group.map((h) => h.ref.platform);

      const id = this.session.add({
        title,
        query,
        refs: group.map((h) => ({
          platform: h.ref.platform,
          title: h.title,
          ref: h.ref,
        })),
      });

      const franimeHit = group.find((h) => h.ref.platform === "franime");

      return {
        id,
        title,
        platforms,
        subtitle: group.find((h) => h.subtitle)?.subtitle,
        titleOriginal: franimeHit?.titleOriginal ?? group.find((h) => h.titleOriginal)?.titleOriginal,
        poster: group.find((h) => h.poster)?.poster,
        format: franimeHit?.format ?? group.find((h) => h.format)?.format,
        status: franimeHit?.status ?? group.find((h) => h.status)?.status,
        note: franimeHit?.note ?? group.find((h) => h.note)?.note,
      };
    });

    return {
      query,
      count: results.length,
      results,
    };
  }

  /** Vide la session — IDs invalidés. Les prochains search recommencent à 1. */
  clearSession(): void {
    this.session.reset();
  }

  async watch(id: number, options: WatchOptions = {}): Promise<WatchResponse> {
    const entry = this.session.get(id);
    if (!entry) {
      throw new Error(`Invalid id ${id}. Run search() first.`);
    }

    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    const lang = options.lang ?? "vostfr";

    const sources: ResolvedSource[] = [];

    for (const platformRef of entry.refs) {
      if (!this.enabledPlatforms.includes(platformRef.platform)) continue;

      const adapter = getAdapter(platformRef.platform);
      if (!adapter) continue;

      let embeds: EmbedSource[] = [];
      try {
        embeds = await adapter.getEpisodeEmbeds(platformRef.ref, {
          season,
          episode,
          lang,
        });
      } catch (err) {
        sources.push({
          platform: platformRef.platform,
          provider: platformRef.platform,
          type: "mp4",
          embedUrl: "",
          streamUrl: "",
          quality: { label: "error", width: null, height: null, bandwidth: null },
          error: err instanceof Error ? err.message : String(err),
        });
        continue;
      }

      const referer = refererForPlatform(platformRef.platform);
      const ctx: ProviderContext = {
        referer,
        headless: this.headless,
      };

      for (const embed of embeds) {
        const providerCtx: ProviderContext = {
          ...ctx,
          parentPageUrl: embed.parentPageUrl,
        };

        try {
          const extracted = await extractStream(embed.embedUrl, providerCtx);
          if (!extracted) {
            sources.push({
              platform: platformRef.platform,
              provider: embed.provider,
              type: "mp4",
              embedUrl: embed.embedUrl,
              streamUrl: "",
              quality: { label: "unknown", width: null, height: null, bandwidth: null },
              error: "Could not extract stream URL",
            });
            continue;
          }

          let resolved: ResolvedSource = {
            platform: platformRef.platform,
            provider: embed.provider,
            type: extracted.type,
            embedUrl: embed.embedUrl,
            streamUrl: extracted.streamUrl,
            quality: {
              label: extracted.type === "mp4" ? "mp4" : "master",
              width: null,
              height: null,
              bandwidth: null,
            },
          };

          if (extracted.type === "hls") {
            const enriched = await enrichHlsStream(extracted.streamUrl, referer);
            resolved.variants = enriched.variants;
            resolved = applyBestVariant(resolved);
          }

          sources.push(resolved);
        } catch (err) {
          sources.push({
            platform: platformRef.platform,
            provider: embed.provider,
            type: "mp4",
            embedUrl: embed.embedUrl,
            streamUrl: "",
            quality: { label: "error", width: null, height: null, bandwidth: null },
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    const best = pickBestSource(sources);

    return {
      id,
      platforms: entry.refs
        .filter((r) => this.enabledPlatforms.includes(r.platform))
        .map((r) => r.platform),
      title: entry.title,
      season,
      episode,
      lang,
      sources,
      best,
    };
  }
}
