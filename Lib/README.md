# anime-scraping-lib

Library to scrape **Anime-Sama**, **VoirAnime**, and **FRAnime** from a single API.

Not on npm — download the bundle from **GitHub Releases** and add it to your project.

→ **Full API documentation: [`docs/`](docs/)**

## What is it?

An `Anime` class with two main methods:

| Method | What it does |
|--------|----------------|
| `search(query)` | Searches all 3 sites in parallel. Returns titles, posters, IDs… **no** stream URLs. |
| `watch(id, options)` | For a search result: fetches **all** video sources, parses M3U8, picks **best quality**. |

IDs (`1`, `2`, `3`…) are kept **in memory** on the `Anime` instance. Each `search()` adds **new** IDs (never reused). `clearSession()` wipes everything.

## Manual installation

### 1. Download the files

1. Go to GitHub → **Releases** for this repo
2. Open the latest release (tag `lib-YYYYMMDD-…`)
3. Download:
   - `anime-scraping-lib.js`
   - `anime-scraping-lib.d.ts`

### 2. Add them to your project

Create a `lib` folder (or any name) at the root of your app:

```
my-project/
  lib/
    anime-scraping-lib.js
    anime-scraping-lib.d.ts
  src/
    main.ts
  package.json
```

### 3. Install Playwright (required for some providers)

The library needs **Playwright** at runtime for certain hosts (Filemoon, VOE, etc.):

```bash
bun add playwright
# or
npm install playwright
npx playwright install chromium
```

Without it, simple HTTP sources (Vidmoly, Sibnet…) may work, but protected providers will fail.

### 4. Import in your code

**Bun / Node (ESM):**

```typescript
import { Anime } from "../lib/anime-scraping-lib.js";

const anime = new Anime({ headless: true });

const { results } = await anime.search("one piece");
console.log(results);
// → [{ id: 1, title: "One Piece", platforms: ["anime-sama", "franime", …], poster: "..." }, ...]

const playback = await anime.watch(1, {
  season: 1,
  episode: 1,
  lang: "vostfr",   // default: vostfr, fallback vf
});

console.log(playback.best?.streamUrl);   // direct URL (.m3u8 or .mp4)
console.log(playback.sources);           // all resolved sources
```

**TypeScript** — if types do not resolve automatically, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false
  }
}
```

In practice, with `anime-scraping-lib.d.ts` next to the `.js` file, TypeScript picks up types automatically.

## Quick API

### `search(query)`

```typescript
const { query, count, results } = await anime.search("naruto");
```

Each `results[i]`:

```typescript
{
  id: number;
  title: string;
  platforms: ("anime-sama" | "voiranime" | "franime")[];
  subtitle?: string;
  poster?: string;
  titleOriginal?: string;
  format?: string;
  status?: string;
}
```

No embed / stream URLs in this JSON.

### `watch(id, options?)`

```typescript
const watch = await anime.watch(2, {
  season: 1,      // default: 1
  episode: 1,     // default: 1
  lang: "vostfr", // default: "vostfr"
});
```

Response:

```typescript
{
  id, platforms, title, season, episode, lang,
  sources: [
    {
      platform: string;
      provider: string;
      type: "hls" | "mp4";
      embedUrl: string;
      streamUrl: string;
      quality: { label, width, height, bandwidth };
      variants?: [...];
      error?: string;
    }
  ],
  best: ResolvedSource | null
}
```

If one provider fails, others continue. `best` = highest resolution (tie-break: bandwidth).

### `clearSession()`

Clears in-memory session. All previous IDs become invalid. Next `search()` starts at `id: 1`.

## Full example

```typescript
import { Anime } from "./lib/anime-scraping-lib.js";

const anime = new Anime({ headless: true });

const search = await anime.search("solo leveling");
if (search.count === 0) {
  console.log("Nothing found");
  return;
}

search.results.forEach((r) => {
  console.log(`${r.id}. [${r.platforms.join(", ")}] ${r.title}`);
});

const watch = await anime.watch(1, { season: 1, episode: 1, lang: "vostfr" });

if (watch.best) {
  console.log("Best source:", watch.best.provider);
  console.log("URL:", watch.best.streamUrl);
} else {
  console.log("No working source:", watch.sources);
}
```

## Options

```typescript
new Anime({
  headless: true,  // Playwright without UI (default). false = visual debug
});
```

## Automated releases

Each push to `Lib/` creates a GitHub release with:

| File | Description |
|------|-------------|
| `anime-scraping-lib.js` | Minified ESM bundle (single file) |
| `anime-scraping-lib.d.ts` | TypeScript declarations (single file) |

Tag: `lib-YYYYMMDD-HHMMSS-<commit>` (UTC date + short hash).

## Playground (local testing)

In `playground/` — interactive demo to test and copy the implementation:

```bash
cd Lib
bun install
bun run playground "one piece"
bun run playground "naruto" --pick 1 --season 1 --episode 1
bun run playground "solo leveling" --search-only
```

See [`playground/README.md`](playground/README.md) for all options.

## Development

Runtime **Bun**:

```bash
cd Lib
bun install
bun run build          # compile src/ → dist/ (dev)
bun run build:release  # release bundle (js + d.ts)
bun run start search "one piece"
bun run start play "one piece" --pick 1 --season 1 --episode 1
```

## Disclaimer

**Educational / research** use only. Respect the terms of service of the analyzed platforms.
