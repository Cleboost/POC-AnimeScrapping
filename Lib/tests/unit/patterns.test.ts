import { describe, expect, test } from "bun:test";
import { decryptJson } from "../../src/webanime/nakanime/crypto.js";
import {
  ANIME_SAMA_EPISODES_JS,
  SENDVID_HTML_M3U8,
  SENDVID_HTML_MP4,
  SIBNET_HTML,
  VIDMOLY_HTML,
} from "../helpers/fixtures.js";

const VIDMOLY_REGEX = /file:\s*["']([^"']+\.m3u8[^"']*)['"]/;
const SIBNET_REGEX = /src:\s*["'](\/v\/[a-f0-9]+\/\d+\.mp4)['"]/;
const SENDVID_REGEX =
  /source\s+src="([^"]+\.(?:m3u8|mp4)[^"]*)"|file:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/;
const EPS_REGEX = /var\s+eps(\d+)\s*=\s*\[([\s\S]*?)\];/g;

describe("patterns extracteurs vidéo", () => {
  test("vidmoly: regex trouve m3u8 dans HTML embed", () => {
    const match = VIDMOLY_HTML.match(VIDMOLY_REGEX);
    expect(match?.[1]).toBe("https://cdn.example.com/hls/master.m3u8?token=abc");
  });

  test("sibnet: regex trouve chemin mp4 relatif", () => {
    const match = SIBNET_HTML.match(SIBNET_REGEX);
    expect(match?.[1]).toBe("/v/deadbeef1234/720.mp4");
  });

  test("sendvid: regex trouve m3u8 dans source tag", () => {
    const match = SENDVID_HTML_M3U8.match(SENDVID_REGEX);
    expect(match?.[1]).toBe("https://videos.sendvid.com/abc/playlist.m3u8");
  });

  test("sendvid: regex trouve mp4 dans file:", () => {
    const match = SENDVID_HTML_MP4.match(SENDVID_REGEX);
    expect(match?.[2]).toBe("https://videos.sendvid.com/abc/video.mp4");
  });
});

describe("patterns anime-sama episodes.js", () => {
  test("parse epsN arrays depuis episodes.js", () => {
    const providers: { id: string; links: string[] }[] = [];
    let match: RegExpExecArray | null;

    while ((match = EPS_REGEX.exec(ANIME_SAMA_EPISODES_JS)) !== null) {
      const links = match[2]
        .split(",")
        .map((link) => link.trim().replace(/'/g, ""))
        .filter((link) => link.startsWith("http"));
      providers.push({ id: match[1], links });
    }

    expect(providers).toHaveLength(2);
    expect(providers[0].links).toHaveLength(2);
    expect(providers[0].links[0]).toContain("vidmoly.to");
    expect(providers[1].links[0]).toContain("sibnet.ru");
  });
});

describe("nakanime crypto", () => {
  function encryptJson(path: string, payload: unknown): ArrayBuffer {
    const salt = "nkapiv1";
    const input = salt + path;
    const key: number[] = [];

    for (let round = 0; round < 32; round++) {
      let acc = 0;
      for (let i = 0; i < input.length; i++) {
        acc = (acc * 31 + input.charCodeAt(i) + round) & 0xff;
      }
      key.push(acc);
    }

    const json = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = new Uint8Array(json.length);
    for (let i = 0; i < json.length; i++) {
      encrypted[i] = json[i] ^ key[i % key.length];
    }
    return encrypted.buffer;
  }

  test("decryptJson déchiffre payload XOR (algorithme nkapiv1)", () => {
    const path = "/api/anime?q=naruto";
    const original = { ok: true, items: [{ id: 1, title: "Naruto" }] };
    const encrypted = encryptJson(path, original);
    const decrypted = decryptJson<typeof original>(path, encrypted);

    expect(decrypted).toEqual(original);
  });
});
