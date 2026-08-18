# Class `Anime`

Library entry point. One instance = one in-memory search session.

```typescript
import { Anime } from "./lib/anime-scraping-lib.js";

const anime = new Anime(options?);
```

---

## `constructor(options?)`

Creates an instance. Options affect **Playwright** during `watch()` (browser providers).

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `AnimeOptions` | `{}` | Optional settings |
| `options.headless` | `boolean` | `true` | When browser is allowed: `true` = no UI, `false` = visible Chromium |
| `options.providers` | `Platform[]` | all | Sites to search/watch. Use exported `providers` constants |
| `options.allowBrowser` | `boolean` | `true` | `false` = HTTP-only extraction, never launch Playwright |

### Example

```typescript
import { Anime, providers, hosts, httpHosts, browserHosts } from "./lib/anime-scraping-lib.js";

const anime = new Anime(); // all platforms, browser allowed

const animeSamaOnly = new Anime({
  providers: [providers.animeSama],
});

// No browser — Vidmoly / Sibnet / Sendvid only (skips Filemoon, VOE, etc.)
const httpOnly = new Anime({
  allowBrowser: false,
});

// Debug visible browser when extraction needs Playwright
const debug = new Anime({ headless: false, allowBrowser: true });

// hosts.vidmoly, hosts.filemoon — see httpHosts vs browserHosts
```

### Returns

`Anime` — the current instance.

---

## `clearSession()`

Clears the in-memory session. All previous IDs become invalid. The next `search()` starts at `id: 1`.

```typescript
await anime.search("one piece"); // ids 1, 2, 3…
await anime.search("naruto");    // ids 4, 5, 6…

anime.clearSession();
await anime.search("bleach");    // ids 1, 2…
```

---

## `search(query)`

Searches **in parallel** on Anime-Sama, VoirAnime, and FRAnime. Appends results to the session with **unique** incrementing IDs.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | yes | Search term (anime name, partial match OK) |

### Returns

`Promise<SearchResponse>` — see [Types → SearchResponse](types.md#searchresponse).

### Behavior

- Aggregates results from all 3 platforms.
- **Groups** identical entries (same anime on multiple sites → one row, `platforms: ["anime-sama", "franime", …]`).
- Each entry has a unique `id` on this instance — IDs **keep incrementing** across `search()` calls (no duplicate id 1).
- **No** stream, embed, or episode page URLs in the response.
- If one platform fails, others continue (no global error).
- `clearSession()` clears everything and resets IDs to 1.

### Example

```typescript
const { query, count, results } = await anime.search("one piece");

console.log(count);                // 28
console.log(results[0].id);        // 1
console.log(results[0].title);     // "One Piece"
console.log(results[0].platforms); // ["anime-sama", "voiranime", "franime"]
```

### Errors

Does not throw on partial platform failure. May throw on critical network errors (rare).

---

## `watch(id, options?)`

Resolves **all** video sources for a `search()` result, extracts direct URLs (.m3u8 / .mp4), parses HLS playlists, and selects `best`.

### Prerequisites

`search()` must have been called **before** on the **same instance**, with a valid `id`.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | `number` | yes | — | ID from `search()` (`results[n].id`) |
| `options` | `WatchOptions` | no | `{}` | Season / episode / language filters |
| `options.season` | `number` | no | `1` | Season number (1-based) |
| `options.episode` | `number` | no | `1` | Episode number (1-based) |
| `options.lang` | `string` | no | `"vostfr"` | Preferred language: `"vostfr"`, `"vf"`, `"vo"`. Auto-fallback if unavailable |

### Returns

`Promise<WatchResponse>` — see [Types → WatchResponse](types.md#watchresponse).

### Behavior

1. For each platform in the group (`entry.refs`), resolves season / episode / embeds.
2. Aggregates **all** sources from **all** sites in the group.
3. For each embed: stream extraction (HTTP or Playwright).
4. If HLS: parse master M3U8, list `variants`, apply best variant.
5. `best` = source with **max height** (1080 > 720 > 480), tie-break = `bandwidth`.

If a provider fails, it appears in `sources` with `error` — others continue.

### Example

```typescript
await anime.search("naruto");

const watch = await anime.watch(1, {
  season: 1,
  episode: 3,
  lang: "vostfr",
});

console.log(watch.best?.streamUrl);
console.log(watch.sources.length);
```

### Errors (throw)

| Message | Cause |
|---------|--------|
| `Invalid id N. Run search() first.` | `id` not in session (no search, or wrong id) |
| `No adapter for platform …` | Unsupported internal platform (bug) |
| `Season N not found` | Season does not exist for this anime |
| `Episode N not found` | Episode does not exist |
| `No providers resolved for episode` | FRAnime: no players resolved |
| `No episode providers found` | Anime-Sama: no `episodes.js` |

Per-provider extraction errors → in `sources[].error`, not a global throw.

### Platform notes

| Platform | `season` | `lang` |
|----------|----------|--------|
| **anime-sama** | Match name (`Saison 1`, `Saga 1`) or URL `saison1`, index fallback | Probe `vostfr`, `vf`, etc. |
| **voiranime** | Ignored (flat episode list) | Ignored (VF/VOSTFR on page) |
| **franime** | API index 0-based internally (`season 1` → index 0) | `"vostfr"`/`"vo"` → `vo`, `"vf"` → `vf` |
