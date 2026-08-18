import { describe, expect, test } from "bun:test";
import { parseM3u8 } from "../../src/provider/m3u8/parser.js";
import {
  applyBestVariant,
  pickBestSource,
  pickBestVariant,
} from "../../src/provider/m3u8/select.js";
import type { ResolvedSource } from "../../src/types.js";
import { M3U8_MASTER, M3U8_MEDIA } from "../helpers/fixtures.js";

describe("m3u8 parser", () => {
  test("parseM3u8 détecte master playlist et variantes", () => {
    const parsed = parseM3u8(M3U8_MASTER, "https://cdn.example.com/master.m3u8");

    expect(parsed.isMaster).toBe(true);
    expect(parsed.variants).toHaveLength(3);
    expect(parsed.variants[0].label).toBe("360p");
    expect(parsed.variants[2].label).toBe("1080p");
    expect(parsed.variants[2].url).toBe("https://cdn.example.com/full/index.m3u8");
  });

  test("parseM3u8 gère playlist media simple", () => {
    const parsed = parseM3u8(M3U8_MEDIA, "https://cdn.example.com/media.m3u8");

    expect(parsed.isMaster).toBe(false);
    expect(parsed.variants).toHaveLength(0);
    expect(parsed.mediaUrl).toBe("https://cdn.example.com/media.m3u8");
  });
});

describe("m3u8 select", () => {
  test("pickBestVariant choisit la meilleure résolution", () => {
    const parsed = parseM3u8(M3U8_MASTER, "https://cdn.example.com/master.m3u8");
    const best = pickBestVariant(parsed.variants);

    expect(best?.label).toBe("1080p");
    expect(best?.height).toBe(1080);
  });

  test("applyBestVariant remplace streamUrl par la meilleure variante", () => {
    const parsed = parseM3u8(M3U8_MASTER, "https://cdn.example.com/master.m3u8");
    const source: ResolvedSource = {
      platform: "franime",
      provider: "vidmoly",
      type: "hls",
      embedUrl: "https://vidmoly.biz/embed-x.html",
      streamUrl: "https://cdn.example.com/master.m3u8",
      quality: { label: "master", width: null, height: null, bandwidth: null },
      variants: parsed.variants,
    };

    const resolved = applyBestVariant(source);
    expect(resolved.streamUrl).toContain("full/index.m3u8");
    expect(resolved.quality.height).toBe(1080);
  });

  test("pickBestSource ignore sources en erreur", () => {
    const sources: ResolvedSource[] = [
      {
        platform: "franime",
        provider: "sibnet",
        type: "mp4",
        embedUrl: "https://sibnet.ru/x",
        streamUrl: "",
        quality: { label: "error", width: null, height: null, bandwidth: null },
        error: "failed",
      },
      {
        platform: "nakanime",
        provider: "vidmoly",
        type: "hls",
        embedUrl: "https://vidmoly.biz/embed-x.html",
        streamUrl: "https://cdn.example.com/hd.m3u8",
        quality: { label: "720p", width: 1280, height: 720, bandwidth: 2_800_000 },
      },
    ];

    const best = pickBestSource(sources);
    expect(best?.provider).toBe("vidmoly");
    expect(best?.quality.height).toBe(720);
  });
});
