import { describe, expect, test } from "bun:test";
import { Anime } from "../../src/client.js";
import { providers } from "../../src/providers.js";
import { NETWORK_TIMEOUT_MS } from "../helpers/contract.js";

describe("contract: Anime client", () => {
  test(
    "search agrège plusieurs plateformes",
    async () => {
      const anime = new Anime({
        providers: [providers.franime, providers.nakanime],
      });

      const response = await anime.search("naruto");

      expect(response.query).toBe("naruto");
      expect(response.count).toBeGreaterThan(0);
      expect(response.results[0].id).toBe(1);
      expect(response.results[0].platforms.length).toBeGreaterThan(0);
    },
    NETWORK_TIMEOUT_MS,
  );

  test(
    "watch résout au moins une source HTTP (sans browser)",
    async () => {
      const anime = new Anime({
        providers: [providers.voiranime],
        allowBrowser: false,
      });

      const search = await anime.search("one piece");
      expect(search.count).toBeGreaterThan(0);

      const watch = await anime.watch(1, {
        season: 1,
        episode: 1,
        lang: "vostfr",
      });

      expect(watch.title.length).toBeGreaterThan(0);
      expect(watch.sources.length).toBeGreaterThan(0);

      const working = watch.sources.filter((s) => !s.error && s.streamUrl);
      expect(working.length).toBeGreaterThan(0);

      const best = watch.best;
      expect(best).not.toBeNull();
      expect(best!.streamUrl).toContain("http");
    },
    NETWORK_TIMEOUT_MS,
  );

  test("clearSession invalide les IDs", async () => {
    const anime = new Anime({ providers: [providers.franime] });
    const search = await anime.search("naruto");
    expect(search.count).toBeGreaterThan(0);

    anime.clearSession();

    await expect(
      anime.watch(1, { season: 1, episode: 1 }),
    ).rejects.toThrow(/Invalid id/);
  });
});
