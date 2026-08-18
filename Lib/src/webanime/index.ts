import type { Platform } from "../types.js";
import type { InternalSearchHit } from "./types.js";
import { animeSamaAdapter } from "./anime-sama/adapter.js";
import { voiranimeAdapter } from "./voiranime/adapter.js";
import { franimeAdapter } from "./franime/adapter.js";
import { nakanimeAdapter } from "./nakanime/adapter.js";
import { mugiwaraAdapter } from "./mugiwara/adapter.js";
import type { WebAnimeAdapter } from "./types.js";

export const adapters: WebAnimeAdapter[] = [
  animeSamaAdapter,
  voiranimeAdapter,
  franimeAdapter,
  nakanimeAdapter,
  mugiwaraAdapter,
];

export function getAdapter(platform: string): WebAnimeAdapter | undefined {
  return adapters.find((a) => a.platform === platform);
}

export async function searchAll(
  query: string,
  platforms: Platform[],
): Promise<InternalSearchHit[]> {
  const active = adapters.filter((a) => platforms.includes(a.platform));
  const results = await Promise.allSettled(active.map((a) => a.search(query)));

  const hits: InternalSearchHit[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      hits.push(...result.value);
    }
  }

  return hits;
}
