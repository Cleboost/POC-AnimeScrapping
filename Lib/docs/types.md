# Exported types

All types are exported from the main entry point.

```typescript
import type {
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
} from "./lib/anime-scraping-lib.js";
```

---

## `AnimeOptions`

Constructor options for `new Anime(…)`.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `headless` | `boolean` | no | `true` | Playwright headless when `allowBrowser` is true |
| `providers` | `Platform[]` | no | all | Platforms to use. Import `providers` for typed keys |
| `allowBrowser` | `boolean` | no | `true` | `false` = skip Playwright (HTTP hosts only) |

### `providers` export (sites)

```typescript
import { providers } from "anime-scraping-lib";

providers.animeSama  // "anime-sama"
providers.voiranime  // "voiranime"
providers.franime    // "franime"
```

### `hosts` export (video extraction)

```typescript
import { hosts, httpHosts, browserHosts, hostNeedsBrowser } from "anime-scraping-lib";

hosts.vidmoly   // HTTP
hosts.sibnet    // HTTP
hosts.sendvid   // HTTP
hosts.filemoon  // requires Playwright

httpHosts       // ["vidmoly", "sibnet", "sendvid"]
browserHosts    // ["filemoon"]
```

Set `allowBrowser: false` to never open a browser — only `httpHosts` can succeed.

```typescript
new Anime({ allowBrowser: false });
new Anime({ providers: [providers.animeSama], allowBrowser: false });
```

---

## `WatchOptions`

Options for `anime.watch(id, options)`.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `season` | `number` | no | `1` | Season (1 = first) |
| `episode` | `number` | no | `1` | Episode (1 = first) |
| `lang` | `string` | no | `"vostfr"` | Language: `vostfr`, `vf`, `vo`, etc. |

---

## `Platform`

Union of supported platforms.

```typescript
type Platform = "anime-sama" | "voiranime" | "franime";
```

---

## `StreamType`

Direct video stream type.

```typescript
type StreamType = "hls" | "mp4";
```

| Value | Description |
|-------|-------------|
| `hls` | `.m3u8` URL (HLS) |
| `mp4` | Direct `.mp4` URL (e.g. Sibnet) |

---

## `Quality`

Quality metadata for a source or variant.

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Readable label: `720p`, `1080p`, `mp4`, `master`, `unknown`, `error` |
| `width` | `number \| null` | Width in pixels |
| `height` | `number \| null` | Height in pixels |
| `bandwidth` | `number \| null` | Bandwidth (bits/s) from M3U8 when available |

---

## `StreamVariant`

One HLS track in a master playlist.

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | e.g. `720p`, `480p` |
| `width` | `number \| null` | Width |
| `height` | `number \| null` | Height |
| `bandwidth` | `number \| null` | Bandwidth |
| `url` | `string` | Variant URL (playlist or media) |

Present in `ResolvedSource.variants` when `type === "hls"` and master playlist was parsed.

---

## `SearchResultItem`

One search result (public metadata, **no playback URLs**).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | yes | ID for `watch(id)` — unique on this instance |
| `title` | `string` | yes | Display title (grouped anime) |
| `platforms` | `Platform[]` | yes | Sites where this anime was found (grouped if same title) |
| `subtitle` | `string` | no | Subtitle / short synopsis / aliases |
| `titleOriginal` | `string` | no | Original title (often FRAnime) |
| `poster` | `string` | no | Poster image URL |
| `format` | `string` | no | Format (e.g. `TV`, `Movie`) — FRAnime |
| `status` | `string` | no | Release status — FRAnime |
| `note` | `number` | no | Rating — FRAnime |

---

## `SearchResponse`

Return value of `anime.search(query)`.

| Field | Type | Description |
|-------|------|-------------|
| `query` | `string` | Query string sent |
| `count` | `number` | Number of results (`results.length`) |
| `results` | `SearchResultItem[]` | Ordered list with IDs |

### JSON example

```json
{
  "query": "one piece",
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "One Piece",
      "platforms": ["anime-sama", "voiranime", "franime"],
      "subtitle": "Wan Pisu…",
      "poster": "https://…"
    }
  ]
}
```

---

## `ResolvedSource`

One resolved video source (one provider / player).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | `Platform` | yes | Source site for this stream |
| `provider` | `string` | yes | Host name: `vidmoly.biz`, `video.sibnet.ru`, `VOE`, etc. |
| `type` | `StreamType` | yes | `hls` or `mp4` |
| `embedUrl` | `string` | yes | Original embed URL (player page) |
| `streamUrl` | `string` | yes | Direct stream URL. Empty if `error` |
| `quality` | `Quality` | yes | Quality of `streamUrl` (or applied best variant) |
| `variants` | `StreamVariant[]` | no | All HLS tracks if master playlist |
| `error` | `string` | no | Message if extraction failed for this provider |

---

## `WatchResponse`

Return value of `anime.watch(id, options)`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | ID passed to `watch()` |
| `platforms` | `Platform[]` | Sites in the group that contributed |
| `title` | `string` | Anime title |
| `season` | `number` | Effective season (after default) |
| `episode` | `number` | Effective episode |
| `lang` | `string` | Requested language |
| `sources` | `ResolvedSource[]` | **All** attempted sources |
| `best` | `ResolvedSource \| null` | Best source (max quality) or `null` if all failed |

### `best` selection

1. Filter sources without `error` and with non-empty `streamUrl`.
2. Score = `height × 1000 + bandwidth / 1000`.
3. Small bonus for HLS with known resolution.
4. MP4 without resolution ranks below HLS with known height.

### JSON example (abbreviated)

```json
{
  "id": 1,
  "platforms": ["anime-sama", "franime"],
  "title": "One Piece",
  "season": 1,
  "episode": 1,
  "lang": "vostfr",
  "sources": [
    {
      "platform": "anime-sama",
      "provider": "vidmoly.biz",
      "type": "hls",
      "embedUrl": "https://…",
      "streamUrl": "https://…/720p/index.m3u8",
      "quality": { "label": "720p", "width": 1280, "height": 720, "bandwidth": 2500000 },
      "variants": [
        { "label": "480p", "width": 854, "height": 480, "bandwidth": 1200000, "url": "…" },
        { "label": "720p", "width": 1280, "height": 720, "bandwidth": 2500000, "url": "…" }
      ]
    }
  ],
  "best": {
    "platform": "anime-sama",
    "provider": "vidmoly.biz",
    "type": "hls",
    "streamUrl": "https://…/720p/index.m3u8",
    "quality": { "label": "720p", "width": 1280, "height": 720, "bandwidth": 2500000 }
  }
}
```
