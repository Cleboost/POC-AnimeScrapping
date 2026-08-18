import type { Platform } from "./types.js";

/** Typed platform identifiers for `Anime` constructor options. */
export const providers = {
  animeSama: "anime-sama",
  voiranime: "voiranime",
  franime: "franime",
} as const satisfies Record<string, Platform>;

export type ProviderKey = keyof typeof providers;

export const allPlatforms: Platform[] = [
  providers.animeSama,
  providers.voiranime,
  providers.franime,
];

/**
 * Video host identifiers (stream extraction layer).
 * Use with `allowedHosts` / `browserHosts` in constructor options.
 */
export const hosts = {
  vidmoly: "vidmoly",
  sibnet: "sibnet",
  sendvid: "sendvid",
  filemoon: "filemoon",
} as const;

export type HostKey = keyof typeof hosts;

/** Hosts that work with HTTP only (no Playwright). */
export const httpHosts: HostKey[] = ["vidmoly", "sibnet", "sendvid"];

/** Hosts that require a browser (Playwright). */
export const browserHosts: HostKey[] = ["filemoon"];

export function hostNeedsBrowser(host: HostKey): boolean {
  return browserHosts.includes(host);
}

