# Chapter 6: Video Stream Extraction — Protected Providers

VoirAnime-specific deep dive. Providers like Filemoon/MOON, VOE, and Streamtape use advanced bot protections that block simple HTTP extraction.

## Mechanism

### A. Cloudflare / Turnstile Bypass

Protected players run JavaScript-based Proof-of-Work (PoW) and Turnstile challenges. Headless mode triggers blocks — Playwright runs in **headful mode (`headless: false`)** to let the browser solve verification naturally.

### B. Domain-Lock Bypass

Some hosts enforce playback only when embedded on `voir-anime.to`. The script:

1. Loads the actual VoirAnime episode page.
2. Injects the player iframe directly into the DOM.

This ensures the browser sends the correct `Referer` and origin headers.

### C. Pop-up Ad Blocking

Providers include invisible ad overlays that open popup tabs on click. A Playwright context listener intercepts and closes popups immediately:

```javascript
context.on("page", async (popup) => {
  if (popup !== page) {
    try { await popup.close(); } catch (e) {}
  }
});
```

The script clicks the player center twice (2.5s interval) to clear overlays and trigger playback. Network requests are intercepted — the first URL matching `.m3u8` or `.mp4` is captured.

## POC Implementation

The script `poc/extract.js` detects the provider from the URL and dispatches to the appropriate strategy (HTTP for Vidmoly, browser for protected hosts).

### Usage

```sh
node poc/extract.js "https://weneverbeenfree.com/e/erf2jhhpjh1d" "https://voir-anime.to/anime/rezero-kara-hajimeru-isekai-seikatsu-s3/re-zero-kara-hajimeru-isekai-seikatsu-saison-3-16-vostfr/"
```

---

**Navigation:** [← Chapter 5](05-stream-extraction-http.md) · [Introduction](00-intro.md)
