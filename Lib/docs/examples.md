# Call examples

Common scenarios with all useful parameters.

---

## Initialization

```typescript
import { Anime } from "./lib/anime-scraping-lib.js";

// Minimal
const anime = new Anime();

// Debug Playwright (show browser)
const animeDebug = new Anime({ headless: false });
```

---

## Search only

```typescript
const anime = new Anime();

const response = await anime.search("solo leveling");

for (const item of response.results) {
  console.log(`[${item.id}] ${item.platforms.join(", ")} — ${item.title}`);
  if (item.poster) console.log(`  poster: ${item.poster}`);
}
```

**Parameters:** `query` (string) only.

---

## Search + watch (full flow)

```typescript
const anime = new Anime({ headless: true });

await anime.search("one piece");

// First result, season 1 episode 1 VOSTFR
const watch = await anime.watch(1);

// Result #3, season 2 episode 5 VF
const watch2 = await anime.watch(3, {
  season: 2,
  episode: 5,
  lang: "vf",
});
```

---

## Using `best` for a player

```typescript
const anime = new Anime();
await anime.search("naruto");
const { best, sources } = await anime.watch(1, { episode: 1 });

if (best && !best.error) {
  // VLC, mpv, hls.js, etc.
  openInPlayer(best.streamUrl);
} else {
  console.log("Failed. Tried:", sources.map((s) => s.error ?? s.provider));
}
```

---

## List all sources (not just best)

```typescript
const { sources } = await anime.watch(1, { season: 1, episode: 1 });

for (const src of sources) {
  if (src.error) {
    console.log(`[${src.platform}] ${src.provider}: FAIL — ${src.error}`);
    continue;
  }
  console.log(`[${src.platform}] ${src.provider} [${src.quality.label}] ${src.streamUrl}`);
  if (src.variants?.length) {
    console.log("  variants:", src.variants.map((v) => v.label).join(", "));
  }
}
```

---

## Multiple searches (unique IDs)

```typescript
const anime = new Anime();

const onePiece = await anime.search("one piece");
// ids 1, 2, 3…

const naruto = await anime.search("naruto");
// ids 4, 5, 6… — one piece ids still valid

await anime.watch(1);  // One Piece
await anime.watch(4);  // first naruto result

anime.clearSession();  // optional — wipe all
```

---

## FRAnime with VF language

```typescript
await anime.search("one piece");

const entry = (await anime.search("one piece")).results.find((r) =>
  r.platforms.includes("franime"),
);
if (!entry) return;

const watch = await anime.watch(entry.id, {
  season: 1,
  episode: 1,
  lang: "vf",
});
```

`lang` also accepts `"vo"` for VOSTFR on FRAnime.

---

## Anime-Sama — saga / season

One Piece uses « Saga 1 » not « Saison 1 ». The lib matches URL `saison1` or index:

```typescript
await anime.search("one piece");

// Saga 1 (East Blue) = season 1
await anime.watch(1, { season: 1, episode: 1 });

// Saga 3 = season 3
await anime.watch(1, { season: 3, episode: 1 });
```

---

## VoirAnime — episode without season

VoirAnime ignores `season` and `lang` (page is already VF or VOSTFR):

```typescript
await anime.search("solo leveling vf");

const va = (await anime.search("solo leveling")).results.find((r) =>
  r.platforms.includes("voiranime"),
);
await anime.watch(va!.id, { episode: 12 });
```

---

## `watch()` parameters

| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| `id` | `number` | — | `1` |
| `options.season` | `number` | `1` | `2` |
| `options.episode` | `number` | `1` | `12` |
| `options.lang` | `string` | `"vostfr"` | `"vf"`, `"vo"` |

---

## Playground CLI (local)

Terminal equivalent in this repo:

```bash
cd Lib
bun run playground "one piece"
bun run playground "naruto" --pick 2 --season 1 --episode 3 --lang vf
bun run playground "bleach" --search-only
bun run playground "one piece" --headful
```

See also [`playground/README.md`](../playground/README.md).
