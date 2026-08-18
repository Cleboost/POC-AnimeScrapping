import { fetchText } from "../shared/fetch.js";
import type { ProviderContext, ExtractResult } from "./types.js";

export async function extractSibnet(url: string, ctx: ProviderContext): Promise<ExtractResult | null> {
  const html = await fetchText(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: ctx.referer,
    },
  });

  const match = html.match(/src:\s*["'](\/v\/[a-f0-9]+\/\d+\.mp4)['"]/);
  if (!match) return null;

  const embedPath = match[1];
  const redirect = await fetch(`https://video.sibnet.ru${embedPath}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: url,
    },
    redirect: "manual",
  });

  const location = redirect.headers.get("location");
  if (!location) return null;

  const streamUrl = location.startsWith("//") ? `https:${location}` : location;
  return { streamUrl, type: "mp4" };
}
