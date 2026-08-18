# Chapter 6: Video Stream Extraction

Once an embed URL is resolved, extraction follows the same provider-specific patterns used in other POCs (Anime-Sama, FRAnime, Nakanime).

## Vidmoly via Ansembed

Catalogue JSON stores `vidmoly.to` / `vidmoly.biz` embed URLs, but Mugiwara's player loads **`ansembed.net`** with the same embed id:

| Catalogue URL | Resolved player URL |
|---------------|---------------------|
| `https://vidmoly.to/embed-y2dfh1ndem54.html` | `https://ansembed.net/embed-y2dfh1ndem54.html` |

`poc/parse.js` applies this rewrite in `resolveEmbedUrl()`. The Ansembed page exposes the `.m3u8` in HTML (`file: '...m3u8'`) — no browser required.

Direct requests to `vidmoly.to` often return **429 Too Many Requests**; use Ansembed instead.

## HTTP providers

| Provider | Technique | Output |
|----------|-----------|--------|
| Vidmoly (via Ansembed) | Parse `file:` from embed HTML | `.m3u8` |
| Sibnet | Parse `/v/...` path, follow redirect | `.mp4` |

## Browser providers

Protected hosts (VOE, OK.ru, some Sendvid) require **Playwright** to capture network requests for `.m3u8` / `.mp4` URLs.

## POC Implementation

`poc/extract.js` detects the provider from the URL and dispatches to the appropriate strategy.

### Usage

```sh
node poc/extract.js "https://vidmoly.to/embed-v67tgm5qa53n.html"
node poc/extract.js "https://video.sibnet.ru/shell.php?videoid=4821207"
```

For protected hosts, install Playwright first:

```sh
cd mugiwara && npm install
```

---

**Navigation:** [← Chapter 5](05-rsc-parsing.md)
