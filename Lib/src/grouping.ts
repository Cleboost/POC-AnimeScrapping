import type { InternalSearchHit } from "./webanime/types.js";

/** Clé de grouping — lowercase, sans accents, sans suffixes VF/KAI/etc. */
export function normalizeAnimeTitle(title: string): string {
  let t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  t = t.replace(/\(.*?\)/g, " ");
  t = t.replace(/\b(vf|vostfr|vost|kai|sd|film|movie|special|ova|ona)\b/gi, " ");
  t = t.replace(/[^a-z0-9]+/g, "");
  return t;
}

function groupingKey(hit: InternalSearchHit): string {
  const fromTitle = normalizeAnimeTitle(hit.title);
  if (fromTitle.length >= 2) return fromTitle;
  if (hit.titleOriginal) return normalizeAnimeTitle(hit.titleOriginal);
  return fromTitle || "unknown";
}

export function pickDisplayTitle(hits: InternalSearchHit[]): string {
  const withoutTag = hits.find(
    (h) => !/\b(vf|vostfr)\b/i.test(h.title) && !/\([^)]*\)/.test(h.title),
  );
  return withoutTag?.title ?? hits[0].title;
}

/** Regroupe les hits identiques (même anime, sites différents). */
export function groupSearchHits(hits: InternalSearchHit[]): InternalSearchHit[][] {
  const groups = new Map<string, InternalSearchHit[]>();

  for (const hit of hits) {
    const key = groupingKey(hit);
    const bucket = groups.get(key);

    if (!bucket) {
      groups.set(key, [hit]);
      continue;
    }

    const alreadyOnPlatform = bucket.some((h) => h.ref.platform === hit.ref.platform);
    if (!alreadyOnPlatform) {
      bucket.push(hit);
    }
  }

  return Array.from(groups.values());
}
