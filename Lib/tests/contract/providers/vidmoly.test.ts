import { describe, expect, test } from "bun:test";
import { voiranimeAdapter } from "../../../src/webanime/voiranime/adapter.js";
import { extractVidmoly } from "../../../src/provider/vidmoly.js";
import { extractStream } from "../../../src/provider/index.js";
import { refererForPlatform } from "../../../src/webanime/shared/headers.js";
import {
  assertEmbedShape,
  findHitByTitleIncludes,
  NETWORK_TIMEOUT_MS,
} from "../../helpers/contract.js";

describe("contract: vidmoly extractor", () => {
  test(
    "extractVidmoly récupère m3u8 depuis embed live",
    async () => {
      const hits = await voiranimeAdapter.search("one piece");
      const hit = findHitByTitleIncludes(hits, "one piece");
      const embeds = await voiranimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      const vidmolyEmbed = embeds.find(
        (e) =>
          e.embedUrl.includes("vidmoly") ||
          e.embedUrl.includes("ansembed"),
      );
      expect(vidmolyEmbed).toBeDefined();
      assertEmbedShape(vidmolyEmbed!);

      const referer = refererForPlatform("voiranime");
      const result = await extractVidmoly(vidmolyEmbed!.embedUrl, { referer });

      expect(result).not.toBeNull();
      expect(result!.type).toBe("hls");
      expect(result!.streamUrl).toContain(".m3u8");
    },
    NETWORK_TIMEOUT_MS,
  );
});

describe("contract: extractStream router", () => {
  test(
    "route vidmoly/ansembed via HTTP sans browser",
    async () => {
      const hits = await voiranimeAdapter.search("one piece");
      const hit = findHitByTitleIncludes(hits, "one piece");
      const embeds = await voiranimeAdapter.getEpisodeEmbeds(hit.ref, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      const target = embeds.find(
        (e) =>
          e.embedUrl.includes("vidmoly") ||
          e.embedUrl.includes("ansembed"),
      );
      expect(target).toBeDefined();

      const result = await extractStream(target!.embedUrl, {
        referer: refererForPlatform("voiranime"),
        headless: true,
        allowBrowser: false,
      });

      expect(result).not.toBeNull();
      expect(result!.streamUrl.length).toBeGreaterThan(0);
      expect(["hls", "mp4"]).toContain(result!.type);
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "refuse filemoon si allowBrowser=false",
    async () => {
      const result = await extractStream(
        "https://filemoon.sx/e/abc123",
        {
          referer: "https://franime.fr/",
          headless: true,
          allowBrowser: false,
        },
      );

      expect(result).toBeNull();
    },
    NETWORK_TIMEOUT_MS,
  );
});
