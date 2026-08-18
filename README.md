# POC Anime Scraping

Monorepo gathering all reverse-engineering / scraping POCs for French anime streaming platforms.

Each subdirectory was previously a standalone repository, with its own docs and scripts.

## Standalone library — [`Lib/`](Lib/)

**[`Lib/`](Lib/)** bundles **all POCs** into one autonomous TypeScript library: a single API to scrape Anime-Sama, VoirAnime, and FRAnime in parallel, without running POC scripts one by one.

- **Multi-scrap** — search all 3 platforms in one call
- **Full pipeline** — `search()` → `watch(id)` with all sources and best quality (M3U8)
- **Optimized bundle** — one minified JS file + `.d.ts`, available on **GitHub Releases** (not on npm)

```typescript
import { Anime } from "./lib/anime-scraping-lib.js";

const anime = new Anime({ headless: true });
const { results } = await anime.search("one piece");
const { best } = await anime.watch(1, { season: 1, episode: 1, lang: "vostfr" });
```

→ Manual install, playground, and full API: **[`Lib/README.md`](Lib/README.md)**

The `anime-sama/`, `voiranime/`, and `franime/` folders remain **documented POCs** (isolated scripts, reverse-engineering chapters). The library is the unified **production-ready** version — try it via `Lib/playground/`.

## Projects (documented POCs)

| Platform | Directory | Chapters | Former repo |
|----------|-----------|----------|-------------|
| **Anime-Sama** | [`anime-sama/`](anime-sama/) | 5 + intro | [POC-Anime-Sama-Scrapping](https://github.com/Cleboost/POC-Anime-Sama-Scrapping) |
| **VoirAnime** | [`voiranime/`](voiranime/) | 6 + intro | [POC-VoirAnime-Scrapping](https://github.com/Cleboost/POC-VoirAnime-Scrapping) |
| **FRAnime** | [`franime/`](franime/) | 7 + intro | [POC-FrAnime-Scrapping](https://github.com/Cleboost/POC-FrAnime-Scrapping) |
| **Nakanime** | [`nakanime/`](nakanime/) | 6 + intro | — |

## Shared Pipeline Steps

Every POC follows the same core steps. Additional chapters are added when a platform requires extra resolution layers or provider-specific techniques.

| Step | Chapter title | Anime-Sama | VoirAnime | FRAnime | Nakanime |
|------|---------------|:----------:|:---------:|:-------:|:--------:|
| — | Introduction | ✓ | ✓ | ✓ | ✓ |
| 1 | Search Engine Analysis | ✓ | ✓ | ✓ | ✓ |
| 2 | Catalog Structure Analysis | ✓ | ✓ | ✓ | ✓ |
| 3 | Language Discovery Analysis | ✓ | ✓ | ✓ | ✓ |
| 4 | Episode List & Providers Analysis | ✓ | ✓ | ✓ | ✓ |
| 5+ | *Platform-specific steps* | Video Stream Extraction | Stream Extraction (HTTP) | Provider URL Resolution | API XOR Decryption |
| | | | Stream Extraction (Browser) | Watch2 XOR Decryption | Video Stream Extraction |

See each project's README for scripts, pipeline details, and full documentation index.

## Structure

```
Lib/          → standalone lib (Bun) — all POCs unified, optimized scraping
anime-sama/   → poc/, docs/, demo/   (documented POC, isolated scripts)
voiranime/    → poc/, docs/, demo/   (documented POC, Playwright)
franime/      → poc/, docs/, demo/   (documented POC, isolated scripts)
nakanime/     → poc/, docs/, demo/   (documented POC, encrypted API)
```

## Quick Start

**Lib (recommended)** — unified multi-platform scraping:

```bash
# From a GitHub Release: copy anime-scraping-lib.js + .d.ts into your project
# See Lib/README.md

cd Lib && bun install && bun run start search "one piece"
```

**Individual POCs** — to study one platform in depth:

**Anime-Sama** (plain Node.js, no `npm install` required):

```bash
node anime-sama/poc/search.js "one piece"
```

**VoirAnime** (requires Playwright for protected providers):

```bash
cd voiranime && npm install && node demo/index.js "rezero"
```

**FRAnime** (plain Node.js):

```bash
node franime/demo/index.js "rezero"
```

**Nakanime** (plain Node.js for catalog, Playwright optional for some providers):

```bash
node nakanime/demo/index.js "naruto"
```

## Disclaimer

These POCs are for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
