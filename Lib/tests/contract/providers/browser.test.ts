import { describe, expect, test } from "bun:test";
import { franimeAdapter } from "../../../src/webanime/franime/adapter.js";
import { extractStream } from "../../../src/provider/index.js";
import { refererForPlatform } from "../../../src/webanime/shared/headers.js";
import {
  findHitByExactTitle,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

const RUN_BROWSER_TESTS = process.env.RUN_BROWSER_TESTS === "1";

describe("contract: browser extractors", () => {
  test.skipIf(!RUN_BROWSER_TESTS)(
    "extractStream avec browser sur provider filemoon (lent, Playwright requis)",
    async () => {
      const hits = await franimeAdapter.search("naruto");
      const hit = findHitByExactTitle(hits, "Naruto");
      const embeds = await franimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      const filemoonEmbed = embeds.find(
        (e) =>
          e.embedUrl.includes("filemoon") ||
          e.embedUrl.includes("weneverbeenfree") ||
          e.provider.includes("bysedikamoum"),
      );

      if (!filemoonEmbed) {
        console.warn("Pas de provider browser dans cet épisode — skip soft");
        return;
      }

      const result = await extractStream(filemoonEmbed.embedUrl, {
        referer: refererForPlatform("franime"),
        headless: true,
        allowBrowser: true,
      });

      expect(result).not.toBeNull();
      expect(result!.streamUrl.length).toBeGreaterThan(0);
    },
    120_000,
  );
});
