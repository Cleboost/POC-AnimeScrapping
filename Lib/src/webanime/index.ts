import type { InternalSearchHit } from "./types.js";
import { animeSamaAdapter } from "./anime-sama/adapter.js";
import { voiranimeAdapter } from "./voiranime/adapter.js";
import { franimeAdapter } from "./franime/adapter.js";
import type { WebAnimeAdapter } from "./types.js";

export const adapters: WebAnimeAdapter[] = [
  animeSamaAdapter,
  voiranimeAdapter,
  franimeAdapter,
];

export function getAdapter(platform: string): WebAnimeAdapter | undefined {
  return adapters.find((a) => a.platform === platform);
}

export async function searchAll(query: string): Promise<InternalSearchHit[]> {
  const results = await Promise.allSettled(adapters.map((a) => a.search(query)));

  const hits: InternalSearchHit[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      hits.push(...result.value);
    }
  }

  return hits;
}
