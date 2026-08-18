# API documentation

Complete reference for **anime-scraping-lib** — everything exported from the bundle / `src/index.ts`.

## Contents

| File | Topic |
|------|-------|
| [Anime](anime.md) | Main class: `constructor`, `clearSession()`, `search()`, `watch()` |
| [Types](types.md) | All exported types and interfaces |
| [Examples](examples.md) | Common call patterns step by step |

## Public exports

```typescript
// Class
export { Anime } from "…";

// Types
export type {
  AnimeOptions,
  Platform,
  Quality,
  ResolvedSource,
  SearchResponse,
  SearchResultItem,
  StreamType,
  StreamVariant,
  WatchOptions,
  WatchResponse,
} from "…";
```

Nothing else is exposed — no utility functions, no internal adapters.

## Typical flow

```
new Anime(options)
    │
    ▼
search(query)  ──► SearchResponse  (in-memory session, unique IDs)
    │
    ▼
watch(id, options?)  ──► WatchResponse  (sources + best)
```

**Important:** use the **same** `Anime` instance for `search()` and `watch()`. Each `search()` adds **new** IDs (no reset). `clearSession()` wipes everything.

## Supported platforms

| `platform` | Site |
|------------|------|
| `anime-sama` | anime-sama.to |
| `voiranime` | voir-anime.to |
| `franime` | franime.fr (API) |

## Runtime requirements

- **Bun** or **Node** (ESM)
- **playwright** installed + Chromium (`npx playwright install chromium`) for protected hosts (Filemoon, VOE, etc.)
