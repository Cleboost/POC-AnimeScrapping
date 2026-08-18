import { describe, expect, test } from "bun:test";
import { franimeAdapter } from "../../../src/webanime/franime/adapter.js";
import {
  assertEmbedShape,
  assertSearchHitShape,
  findHitByExactTitle,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: franime", () => {
  test(
    "search retourne des résultats avec animeId",
    async () => {
      const hits = await franimeAdapter.search("naruto");

      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits.slice(0, 3)) {
        assertSearchHitShape(hit);
        expect(hit.ref.platform).toBe("franime");
        if (hit.ref.platform === "franime") {
          expect(hit.ref.animeId).toBeTruthy();
        }
      }
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "getEpisodeEmbeds déchiffre watch2 et retourne providers",
    async () => {
      const hits = await franimeAdapter.search("naruto");
      const hit = findHitByExactTitle(hits, "Naruto");

      const embeds = await franimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      expect(embeds.length).toBeGreaterThan(0);
      for (const embed of embeds) {
        assertEmbedShape(embed);
      }
    },
    NETWORK_TIMEOUT_MS,
  );
});
