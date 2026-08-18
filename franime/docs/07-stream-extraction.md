# Chapter 7: Video Stream Extraction

The final step extracts a playable stream URL (`.m3u8` or `.mp4`) from the provider's embed page. Each provider has a different mechanism.

## Vidmoly

Vidmoly serves video via **HLS**. The embed page loads JW Player with an inlined `file:` property:

```js
jwplayer("player").setup({
  file: 'https://prx-xxx.vmwesa.online/hls2/.../master.m3u8?t=...',
  ...
});
```

A single fetch + regex is sufficient — no browser needed.

### Example

`https://prx-1359-ant-vp.vmwesa.online/hls2/02/01915/awjm3il8rk3p_,n,l,.urlset/master.m3u8?t=...`

## Sibnet

Sibnet serves video as a signed `.mp4` on their CDN. The URL is time-limited (the `e=` parameter is a Unix timestamp expiry).

### Extraction — two HTTP requests, no browser

1. **Fetch the embed page** (`shell.php?videoid=...`): HTML contains a JW Player `src:` with a path like `/v/<token>/<videoid>.mp4`.
2. **Follow the redirect**: `GET https://video.sibnet.ru/v/<token>/<videoid>.mp4` returns a `302` to the real CDN URL.

```
GET https://video.sibnet.ru/v/daa4d85ca35bf1a6d5b6221e23bab411/4956170.mp4
→ 302 Location: //dv97.sibnet.ru/46/16/29/4616290.mp4?st=...&e=...
```

### Why the playlist API doesn't work

`/export/playlist_xml.php` returns **related videos**, not the current video's stream.

## Sendvid

Sendvid embeds a standard HTML5 `<video>` player. The source URL is in a `<source src="...">` tag or a `file:` property. A single fetch + regex is sufficient.

## POC Implementation

The script `poc/extract.js` detects the provider from the URL and dispatches to the appropriate extractor.

### Usage

```sh
# Vidmoly
node poc/extract.js "https://vidmoly.biz/embed-cbp5sc7ez1za.html"

# Sibnet
node poc/extract.js "https://video.sibnet.ru/shell.php?videoid=4956170"

# Sendvid
node poc/extract.js "https://sendvid.com/embed/..."
```

---

**Navigation:** [← Chapter 6](06-watch2-decryption.md) · [Introduction](00-intro.md)
