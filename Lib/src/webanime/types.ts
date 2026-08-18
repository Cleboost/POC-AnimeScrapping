import type { Platform } from "../types.js";
import type { WatchOptions } from "../types.js";

export interface InternalSearchHit {
  title: string;
  subtitle?: string;
  titleOriginal?: string;
  poster?: string;
  format?: string;
  status?: string;
  note?: number;
  ref: InternalRef;
}

export type InternalRef =
  | AnimeSamaRef
  | VoiranimeRef
  | FranimeRef
  | NakanimeRef;

export interface AnimeSamaRef {
  platform: "anime-sama";
  catalogUrl: string;
}

export interface VoiranimeRef {
  platform: "voiranime";
  animeUrl: string;
}

export interface FranimeRef {
  platform: "franime";
  animeId: string;
}

export interface NakanimeRef {
  platform: "nakanime";
  animeId: number;
}

export interface EmbedSource {
  provider: string;
  embedUrl: string;
  parentPageUrl?: string;
}

export interface WebAnimeAdapter {
  readonly platform: Platform;
  search(query: string): Promise<InternalSearchHit[]>;
  getEpisodeEmbeds(ref: InternalRef, options: WatchOptions): Promise<EmbedSource[]>;
}
