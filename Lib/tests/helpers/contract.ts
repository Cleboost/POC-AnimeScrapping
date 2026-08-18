import { expect } from "bun:test";
import type { EmbedSource, InternalSearchHit } from "../../src/webanime/types.js";

/** Timeout réseau pour les tests contract (APIs live). */
export const NETWORK_TIMEOUT_MS = 60_000;

export function assertHttpUrl(url: string): void {
  expect(() => new URL(url)).not.toThrow();
  expect(url.startsWith("http://") || url.startsWith("https://")).toBe(true);
}

export function assertSearchHitShape(hit: InternalSearchHit): void {
  expect(hit.title.length).toBeGreaterThan(0);
  expect(hit.ref.platform).toBeTruthy();
}

export function assertEmbedShape(embed: EmbedSource): void {
  expect(embed.provider.length).toBeGreaterThan(0);
  assertHttpUrl(embed.embedUrl);
}

export function findHit(
  hits: InternalSearchHit[],
  predicate: (hit: InternalSearchHit) => boolean,
): InternalSearchHit {
  const hit = hits.find(predicate);
  expect(hit).toBeDefined();
  return hit!;
}

export function findHitByTitleIncludes(
  hits: InternalSearchHit[],
  fragment: string,
): InternalSearchHit {
  const lower = fragment.toLowerCase();
  return findHit(hits, (h) => h.title.toLowerCase().includes(lower));
}

export function findHitByExactTitle(
  hits: InternalSearchHit[],
  title: string,
): InternalSearchHit {
  return findHit(hits, (h) => h.title === title);
}
