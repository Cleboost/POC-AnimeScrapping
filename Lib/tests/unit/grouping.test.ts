import { describe, expect, test } from "bun:test";
import {
  groupSearchHits,
  normalizeAnimeTitle,
  pickDisplayTitle,
} from "../../src/grouping.js";
import type { InternalSearchHit } from "../../src/webanime/types.js";

function hit(
  title: string,
  platform: InternalSearchHit["ref"]["platform"],
  extra: Partial<InternalSearchHit> = {},
): InternalSearchHit {
  const ref =
    platform === "anime-sama"
      ? { platform, catalogUrl: "https://anime-sama.to/catalogue/x" }
      : platform === "voiranime"
        ? { platform, animeUrl: "https://voir-anime.to/anime/x" }
        : platform === "franime"
          ? { platform, animeId: "1" }
          : platform === "nakanime"
            ? { platform, animeId: 1 }
            : { platform, slug: "x" };

  return { title, ref, ...extra };
}

describe("grouping", () => {
  test("normalizeAnimeTitle retire accents, tags et ponctuation", () => {
    expect(normalizeAnimeTitle("Naruto Shippūden (VF)")).toBe("narutoshippuden");
    expect(normalizeAnimeTitle("One Piece - Film")).toBe("onepiece");
    expect(normalizeAnimeTitle("Solo Leveling VOSTFR")).toBe("sololeveling");
  });

  test("groupSearchHits fusionne même anime sur plateformes différentes", () => {
    const hits = [
      hit("Naruto", "franime"),
      hit("Naruto", "nakanime"),
      hit("One Piece", "anime-sama"),
    ];

    const groups = groupSearchHits(hits);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.length === 2)?.map((h) => h.ref.platform)).toEqual([
      "franime",
      "nakanime",
    ]);
  });

  test("groupSearchHits ne duplique pas même plateforme", () => {
    const hits = [hit("Naruto", "franime"), hit("Naruto VF", "franime")];
    const groups = groupSearchHits(hits);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(1);
  });

  test("pickDisplayTitle préfère titre sans tag VF/VOSTFR", () => {
    const hits = [hit("Naruto (VF)", "franime"), hit("Naruto", "nakanime")];
    expect(pickDisplayTitle(hits)).toBe("Naruto");
  });
});
