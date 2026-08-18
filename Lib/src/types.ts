export type Platform = "anime-sama" | "voiranime" | "franime" | "nakanime" | "mugiwara";

export type StreamType = "hls" | "mp4";

export interface Quality {
  label: string;
  width: number | null;
  height: number | null;
  bandwidth: number | null;
}

export interface StreamVariant {
  label: string;
  width: number | null;
  height: number | null;
  bandwidth: number | null;
  url: string;
}

export interface SearchResultItem {
  id: number;
  title: string;
  platforms: Platform[];
  subtitle?: string;
  titleOriginal?: string;
  poster?: string;
  format?: string;
  status?: string;
  note?: number;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResultItem[];
}

export interface WatchOptions {
  season?: number;
  episode?: number;
  lang?: string;
}

export interface ResolvedSource {
  platform: Platform;
  provider: string;
  type: StreamType;
  embedUrl: string;
  streamUrl: string;
  quality: Quality;
  variants?: StreamVariant[];
  error?: string;
}

export interface WatchResponse {
  id: number;
  platforms: Platform[];
  title: string;
  season: number;
  episode: number;
  lang: string;
  sources: ResolvedSource[];
  best: ResolvedSource | null;
}

export interface AnimeOptions {
  headless?: boolean;
  /** Platforms to search and watch. Defaults to all. */
  providers?: Platform[];
  /**
   * Allow Playwright-based stream extraction (Filemoon, VOE, fallbacks).
   * `false` = HTTP-only (Vidmoly, Sibnet, Sendvid). No browser launched.
   */
  allowBrowser?: boolean;
}
