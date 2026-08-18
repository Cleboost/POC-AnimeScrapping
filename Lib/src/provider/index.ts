import { extractVidmoly } from "./vidmoly.js";
import { extractSibnet } from "./sibnet.js";
import { extractSendvid } from "./sendvid.js";
import { extractFilemoon } from "./filemoon.js";
import { extractWithBrowser } from "./browser.js";
import type { ProviderContext, ExtractResult } from "./types.js";

function isBrowserOnlyHost(embedUrl: string): boolean {
  const lower = embedUrl.toLowerCase();
  return (
    lower.includes("filemoon") ||
    lower.includes("weneverbeenfree") ||
    lower.includes("q8y5z")
  );
}

function browserAllowed(ctx: ProviderContext): boolean {
  return ctx.allowBrowser !== false;
}

export async function extractStream(
  embedUrl: string,
  ctx: ProviderContext,
): Promise<ExtractResult | null> {
  const lower = embedUrl.toLowerCase();

  if (isBrowserOnlyHost(embedUrl) && !browserAllowed(ctx)) {
    return null;
  }

  if (lower.includes("vidmoly")) {
    try {
      const result = await extractVidmoly(embedUrl, ctx);
      if (result) return result;
    } catch {
      /* fallback to browser if allowed */
    }
    if (!browserAllowed(ctx)) return null;
    return extractWithBrowser(embedUrl, ctx);
  }

  if (lower.includes("sibnet")) {
    return extractSibnet(embedUrl, ctx);
  }

  if (lower.includes("sendvid")) {
    return extractSendvid(embedUrl, ctx);
  }

  if (isBrowserOnlyHost(embedUrl)) {
    return extractFilemoon(embedUrl, ctx);
  }

  if (!browserAllowed(ctx)) return null;
  return extractWithBrowser(embedUrl, ctx);
}

export function providerNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
