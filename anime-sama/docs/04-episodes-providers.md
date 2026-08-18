# Chapter 4: Episode List & Providers Analysis

The streaming data for each season is contained in a separate `episodes.js` file.

## Endpoint

- **URL**: `https://anime-sama.to/catalogue/{anime}/{season}/{language}/episodes.js`
- **Method**: `GET`

## Mechanism

The `episodes.js` file contains global variables for each available video provider:

- `var eps1 = [...]`: episode URLs for the first provider (e.g. Smoothpre).
- `var eps2 = [...]`: episode URLs for the second provider (e.g. Vidmoly).
- `var eps3 = [...]`: episode URLs for the third provider (e.g. Sibnet).

## POC Implementation

The script `poc/episodes.js` implements this by:

1. Fetching the raw JS code from the `episodes.js` file.
2. Using a global regex to match the `epsX` array definitions.
3. Extracting and cleaning the episode URLs.
4. Identifying the provider name (e.g. `vidmoly.to`, `sendvid.com`) from the first link in each array.

### Special Handling: Vidmoly

For **Vidmoly**, the site's default `.to` links are sometimes blocked. The script automatically replaces `.to` with `.biz` for these URLs.

### Usage

```sh
node poc/episodes.js "https://anime-sama.to/catalogue/jujutsu-kaisen/saison1/vostfr/"
```

---

**Navigation:** [← Chapter 3](03-language-discovery.md) · [Chapter 5 — Video Stream Extraction →](05-stream-extraction.md)
