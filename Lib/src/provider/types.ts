export type StreamType = "hls" | "mp4";

export interface ProviderContext {
  referer: string;
  headless?: boolean;
  /** When false, skip Playwright extraction entirely (HTTP-only). */
  allowBrowser?: boolean;
  parentPageUrl?: string;
}

export interface ExtractResult {
  streamUrl: string;
  type: StreamType;
}
