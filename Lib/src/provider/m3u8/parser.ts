import type { StreamVariant } from "../../types.js";

export interface ParsedPlaylist {
  isMaster: boolean;
  variants: StreamVariant[];
  mediaUrl?: string;
}

export async function fetchPlaylist(url: string, referer: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: referer,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: HTTP ${response.status}`);
  }
  return response.text();
}

function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith("http://") || relative.startsWith("https://")) {
    return relative;
  }
  const baseUrl = new URL(base);
  if (relative.startsWith("/")) {
    return `${baseUrl.origin}${relative}`;
  }
  const path = baseUrl.pathname.replace(/\/[^/]*$/, "/");
  return `${baseUrl.origin}${path}${relative}`;
}

function labelFromHeight(height: number | null): string {
  if (!height) return "unknown";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  if (height >= 480) return "480p";
  if (height >= 360) return "360p";
  return `${height}p`;
}

export function parseM3u8(content: string, baseUrl: string): ParsedPlaylist {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const variants: StreamVariant[] = [];
  let isMaster = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;

    isMaster = true;
    const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
    const resolutionMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
    const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1], 10) : null;
    const width = resolutionMatch ? parseInt(resolutionMatch[1], 10) : null;
    const height = resolutionMatch ? parseInt(resolutionMatch[2], 10) : null;

    const nextLine = lines[i + 1];
    if (!nextLine || nextLine.startsWith("#")) continue;

    const url = resolveUrl(baseUrl, nextLine);
    variants.push({
      label: labelFromHeight(height),
      width,
      height,
      bandwidth,
      url,
    });
  }

  if (!isMaster) {
    return { isMaster: false, variants: [], mediaUrl: baseUrl };
  }

  return { isMaster: true, variants };
}

export async function enrichHlsStream(
  streamUrl: string,
  referer: string,
): Promise<{ variants: StreamVariant[]; bestUrl: string }> {
  const content = await fetchPlaylist(streamUrl, referer);
  const parsed = parseM3u8(content, streamUrl);

  if (!parsed.isMaster) {
    const variant: StreamVariant = {
      label: "media",
      width: null,
      height: null,
      bandwidth: null,
      url: streamUrl,
    };
    return { variants: [variant], bestUrl: streamUrl };
  }

  return {
    variants: parsed.variants,
    bestUrl: streamUrl,
  };
}
