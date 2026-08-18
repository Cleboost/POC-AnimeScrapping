import { describe, expect, test } from "bun:test";
import { voiranimeAdapter } from "../../../src/webanime/voiranime/adapter.js";
import {
  assertEmbedShape,
  assertSearchHitShape,
  findHitByTitleIncludes,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: voiranime", () => {
  test(
    "search retourne des résultats avec animeUrl",
    async () => {
      const hits = await voiranimeAdapter.search("one piece");

      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits.slice(0, 3)) {
        assertSearchHitShape(hit);
        expect(hit.ref.platform).toBe("voiranime");
        if (hit.ref.platform === "voiranime") {
          expect(hit.ref.animeUrl).toContain("voir-anime");
        }
      }
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "getEpisodeEmbeds résout épisode avec players embed",
    async () => {
      const hits = await voiranimeAdapter.search("one piece");
      const hit = findHitByTitleIncludes(hits, "one piece");

      const embeds = await voiranimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      expect(embeds.length).toBeGreaterThan(0);
      for (const embed of embeds) {
        assertEmbedShape(embed);
        expect(embed.parentPageUrl).toBeTruthy();
      }
    },
    NETWORK_TIMEOUT_MS,
  );
});
