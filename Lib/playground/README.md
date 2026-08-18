# Playground

Small sandbox to test the library locally and see how to implement it.

## Interactive demo (src/)

Direct import from source code — for development in this repo:

```bash
cd Lib
bun install
bun run playground "one piece"
bun run playground "naruto" --pick 1 --season 1 --episode 1 --lang vostfr
bun run playground "solo leveling" --search-only
bun run playground "one piece" --headful   # Playwright debug
```

## Release bundle test

Verify the minified file (GitHub Release) works the same:

```bash
bun run build:release
bun run playground:bundle
```

## What it demonstrates

`demo.ts` — typical app implementation:

```typescript
import { Anime } from "../src/index.ts"; // or "../lib/anime-scraping-lib.js" in production

const anime = new Anime({ headless: true });
const search = await anime.search("one piece");
const watch = await anime.watch(1, { season: 1, episode: 1, lang: "vostfr" });
```

`from-bundle.ts` — same thing using the bundle downloaded from Releases.
