# Chapter 5: Video Stream Extraction — HTTP Providers

Once a provider embed URL is obtained (Chapter 4), we extract the raw video file link. Some providers expose the stream URL directly in their HTML — no browser needed.

## Vidmoly

The raw `.m3u8` URL is embedded in plain text inside the player HTML:

```javascript
const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
```

### Mechanism

Vidmoly loads JW Player with an inlined `file:` property. A single `fetch` + regex is sufficient.

### Usage

```sh
node poc/extract.js "https://vidmoly.biz/embed-n5n33nx6y8el.html" "https://voir-anime.to/anime/.../episode-page/"
```

Protected providers (Filemoon, VOE, Streamtape) require browser automation — see [Chapter 6](06-stream-extraction-browser.md).

---

**Navigation:** [← Chapter 4](04-episodes-providers.md) · [Chapter 6 — Video Stream Extraction (Browser) →](06-stream-extraction-browser.md)
