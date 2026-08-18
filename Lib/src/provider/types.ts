export type StreamType = "hls" | "mp4";

export interface ProviderContext {
  referer: string;
  headless?: boolean;
  parentPageUrl?: string;
}

export interface ExtractResult {
  streamUrl: string;
  type: StreamType;
}
