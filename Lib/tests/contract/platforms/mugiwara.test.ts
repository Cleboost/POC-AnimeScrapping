import { describe, expect, test } from "bun:test";
import { mugiwaraAdapter } from "../../../src/webanime/mugiwara/adapter.js";
import {
  assertEmbedShape,
  assertSearchHitShape,
  findHitByExactTitle,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: mugiwara", () => {
  test(
    "search retourne des résultats avec slug",
    async () => {
      const hits = await mugiwaraAdapter.search("naruto");

      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits.slice(0, 3)) {
        assertSearchHitShape(hit);
        expect(hit.ref.platform).toBe("mugiwara");
        if (hit.ref.platform === "mugiwara") {
          expect(hit.ref.slug.length).toBeGreaterThan(0);
        }
      }
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "getEpisodeEmbeds parse RSC Next.js et retourne embeds",
    async () => {
      const hits = await mugiwaraAdapter.search("naruto");
      const hit = findHitByExactTitle(hits, "Naruto");

      const embeds = await mugiwaraAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      expect(embeds.length).toBeGreaterThan(0);
      for (const embed of embeds) {
        assertEmbedShape(embed);
        expect(embed.parentPageUrl).toContain("mugiwara-no-streaming.com");
      }
    },
    NETWORK_TIMEOUT_MS,
  );
});
