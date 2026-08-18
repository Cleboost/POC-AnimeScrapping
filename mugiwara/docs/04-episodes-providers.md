# Chapter 4: Episode List & Providers Analysis

Provider embed URLs are resolved directly from the catalogue JSON — no extra API call is required.

## Resolution logic

1. Fetch `/catalogue/{slug}` and parse the embedded `animeServer` JSON.
2. Find the season by `id` (e.g. `"1"`, `"1hs"`, `"kai"`).
3. Pick the language (`vostfr`, `vf`).
4. For each provider array, read `urls[episodeNumber - 1]`.

## Provider entry

```json
{
  "index": 0,
  "host": "vidmoly",
  "language": "VOSTFR",
  "embedUrl": "https://vidmoly.to/embed-v67tgm5qa53n.html"
}
```

## Episode index

Episode numbers are **1-based** in the POC scripts but map to **0-based** indices in the URL arrays.

## POC Implementation

`poc/sources.js` orchestrates catalogue parsing and returns all providers for one episode.

### Usage

```sh
node poc/sources.js naruto 1 1
node poc/sources.js naruto kai 5 vostfr
node poc/sources.js naruto 1hs 10 vf
```

---

**Navigation:** [← Chapter 3](03-language-discovery.md) · [Chapter 5 — Next.js RSC Payload Parsing →](05-rsc-parsing.md)
