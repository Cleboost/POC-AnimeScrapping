import { fetchText } from "../shared/fetch.js";
import type { ProviderContext, ExtractResult } from "./types.js";

const M3U8_REGEX = /file:\s*["']([^"']+\.m3u8[^"']*)['"]/;

export async function extractVidmoly(url: string, ctx: ProviderContext): Promise<ExtractResult | null> {
  const html = await fetchText(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: ctx.referer,
    },
  });

  const match = html.match(M3U8_REGEX);
  if (!match) return null;

  return { streamUrl: match[1], type: "hls" };
}
