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
