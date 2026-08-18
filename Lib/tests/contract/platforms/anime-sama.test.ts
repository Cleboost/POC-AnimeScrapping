import { describe, expect, test } from "bun:test";
import { animeSamaAdapter } from "../../../src/webanime/anime-sama/adapter.js";
import {
  assertEmbedShape,
  assertSearchHitShape,
  findHitByTitleIncludes,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: anime-sama", () => {
  test(
    "search retourne des résultats avec catalogUrl",
    async () => {
      const hits = await animeSamaAdapter.search("one piece");

      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits.slice(0, 3)) {
        assertSearchHitShape(hit);
        expect(hit.ref.platform).toBe("anime-sama");
        if (hit.ref.platform === "anime-sama") {
          expect(hit.ref.catalogUrl).toContain("anime-sama");
        }
      }
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "getEpisodeEmbeds résout S1E1 avec URLs embed valides",
    async () => {
      const hits = await animeSamaAdapter.search("one piece");
      const hit = findHitByTitleIncludes(hits, "one piece");

      const embeds = await animeSamaAdapter.getEpisodeEmbeds(hit.ref, {
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
