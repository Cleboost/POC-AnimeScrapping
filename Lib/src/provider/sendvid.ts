import { fetchText } from "../shared/fetch.js";
import type { ProviderContext, ExtractResult } from "./types.js";

const STREAM_REGEX =
  /source\s+src="([^"]+\.(?:m3u8|mp4)[^"]*)"|file:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/;

export async function extractSendvid(url: string, ctx: ProviderContext): Promise<ExtractResult | null> {
  const html = await fetchText(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: ctx.referer,
    },
  });

  const match = html.match(STREAM_REGEX);
  if (!match) return null;

  const streamUrl = match[1] || match[2];
  const type = streamUrl.includes(".m3u8") ? "hls" : "mp4";
  return { streamUrl, type };
}
