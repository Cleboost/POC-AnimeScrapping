# Chapter 5: Video Stream Extraction

The final step extracts a playable stream URL (`.m3u8` or `.mp4`) from a provider's embed page.

## Vidmoly

Vidmoly is the primary provider on Anime-Sama. It serves video via **HLS** using JW Player.

### Extraction mechanism

The `jwplayer().setup()` call in the embed page HTML contains a `file:` property with the `.m3u8` URL:

```js
jwplayer("player").setup({
  file: 'https://prx-xxx.vmwesa.online/hls2/.../master.m3u8?t=...',
  ...
});
```

A single fetch + regex is sufficient — no browser needed.

### Example stream URL

`https://prx-1359-ant-vp.vmwesa.online/hls2/02/01915/awjm3il8rk3p_,n,l,.urlset/master.m3u8?t=...`

## Other Providers

Sendvid and Sibnet embed URLs are returned by `episodes.js` (Chapter 4). Their extraction follows similar HTTP-only patterns — a fetch of the embed page followed by regex on `file:` or `<source src="...">` tags. See the [FRAnime Chapter 5](../franime/docs/05-stream-extraction.md) for Sibnet and Sendvid deep dives.

## POC Implementation

The script `poc/vidmoly.js` implements Vidmoly extraction by:

1. Fetching the HTML of the Vidmoly embed page.
2. Using a regex to find the `file: '...'` property containing the `.m3u8` link.
3. Extracting metadata such as title, poster, and duration.

### Usage

```sh
node poc/vidmoly.js "https://vidmoly.biz/embed-xxxxx.html"
```

---

**Navigation:** [← Chapter 4](04-episodes-providers.md) · [Introduction](00-intro.md)
