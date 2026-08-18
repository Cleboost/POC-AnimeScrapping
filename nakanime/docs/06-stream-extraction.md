# Chapter 6: Video Stream Extraction

Once provider embed URLs are obtained, streams are extracted using provider-specific techniques.

## Supported providers

| Provider | Method | Format |
|----------|--------|--------|
| Vidmoly | HTTP regex on embed page | HLS (`.m3u8`) |
| Sibnet | HTTP regex + redirect follow | MP4 |
| VOE / OK.ru | Playwright network intercept | HLS / MP4 |

## Vidmoly (HTTP)

```javascript
const html = await fetch(embedUrl).then(r => r.text());
const match = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
```

## Sibnet (HTTP)

1. Parse `src: '/v/...'` from embed page
2. Follow redirect on `https://video.sibnet.ru/v/...`
3. Read `Location` header for final MP4 URL

## Protected providers (Playwright)

For VOE, OK.ru, and other protected hosts, `poc/extract.js` falls back to Playwright with network request interception.

```bash
cd nakanime && npm install
node poc/extract.js "https://rebeccapracticeloss.com/e/g4yfrfa1egk1"
```

## POC Implementation

`poc/extract.js` auto-detects the provider from the embed URL.

### Usage

```sh
node poc/extract.js "https://vidmoly.org/embed-y2dfh1ndem54.html"
node poc/extract.js "https://video.sibnet.ru/shell.php?videoid=4963284"
```

---

**Navigation:** [← Chapter 5](05-api-decryption.md)
