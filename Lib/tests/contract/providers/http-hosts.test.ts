import { describe, expect, test } from "bun:test";
import { franimeAdapter } from "../../../src/webanime/franime/adapter.js";
import { extractSibnet } from "../../../src/provider/sibnet.js";
import { extractSendvid } from "../../../src/provider/sendvid.js";
import { refererForPlatform } from "../../../src/webanime/shared/headers.js";
import {
  assertEmbedShape,
  findHitByExactTitle,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

const RUN_LIVE_HOST_TESTS = process.env.RUN_LIVE_HOST_TESTS === "1";

describe("contract: sibnet extractor", () => {
  test.skipIf(!RUN_LIVE_HOST_TESTS)(
    "extractSibnet live (nécessite RUN_LIVE_HOST_TESTS=1, souvent bloqué par IP)",
    async () => {
      const hits = await franimeAdapter.search("naruto");
      const hit = findHitByExactTitle(hits, "Naruto");
      const embeds = await franimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      const sibnetEmbed = embeds.find((e) => e.embedUrl.includes("sibnet"));
      expect(sibnetEmbed).toBeDefined();
      assertEmbedShape(sibnetEmbed!);

      const result = await extractSibnet(sibnetEmbed!.embedUrl, {
        referer: refererForPlatform("franime"),
        headless: true,
        allowBrowser: false,
      });

      expect(result).not.toBeNull();
      expect(result!.type).toBe("mp4");
      expect(result!.streamUrl).toContain("http");
    },
    NETWORK_TIMEOUT_MS,
  );
});

describe("contract: sendvid extractor", () => {
  test.skipIf(!RUN_LIVE_HOST_TESTS)(
    "extractSendvid live (nécessite RUN_LIVE_HOST_TESTS=1)",
    async () => {
      const hits = await franimeAdapter.search("naruto");
      const hit = findHitByExactTitle(hits, "Naruto");
      const embeds = await franimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      const sendvidEmbed = embeds.find((e) => e.embedUrl.includes("sendvid"));
      expect(sendvidEmbed).toBeDefined();
      assertEmbedShape(sendvidEmbed!);

      const result = await extractSendvid(sendvidEmbed!.embedUrl, {
        referer: refererForPlatform("franime"),
        headless: true,
        allowBrowser: false,
      });

      expect(result).not.toBeNull();
      expect(result!.streamUrl.length).toBeGreaterThan(0);
      expect(["hls", "mp4"]).toContain(result!.type);
    },
    NETWORK_TIMEOUT_MS,
  );
});

// Sanity: les tests skip sont documentés — patterns HTML testés dans tests/unit/patterns.test.ts
