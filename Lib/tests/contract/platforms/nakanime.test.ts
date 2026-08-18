import { describe, expect, test } from "bun:test";
import { nakanimeAdapter } from "../../../src/webanime/nakanime/adapter.js";
import {
  assertEmbedShape,
  assertSearchHitShape,
  findHit,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: nakanime", () => {
  test(
    "search retourne des résultats avec animeId numérique",
    async () => {
      const hits = await nakanimeAdapter.search("naruto");

      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits.slice(0, 3)) {
        assertSearchHitShape(hit);
        expect(hit.ref.platform).toBe("nakanime");
        if (hit.ref.platform === "nakanime") {
          expect(typeof hit.ref.animeId).toBe("number");
          expect(hit.ref.animeId).toBeGreaterThan(0);
        }
      }
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "getEpisodeEmbeds déchiffre API XOR et retourne sources",
    async () => {
      const hits = await nakanimeAdapter.search("naruto shippuden");
      const hit = findHit(
        hits,
        (h) =>
          h.title.toLowerCase().includes("shippuden") &&
          !h.title.toLowerCase().includes("boruto"),
      );

      const embeds = await nakanimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      expect(embeds.length).toBeGreaterThan(0);
      for (const embed of embeds) {
        assertEmbedShape(embed);
        expect(embed.parentPageUrl).toContain("nakanime.tv");
      }
    },
    NETWORK_TIMEOUT_MS,
  );
});
