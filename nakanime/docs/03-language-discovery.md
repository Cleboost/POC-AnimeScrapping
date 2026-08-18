# Chapter 3: Language Discovery Analysis

Unlike WordPress-based platforms, Nakanime does not maintain separate VF/VOSTFR pages per anime. Languages are discovered at the **provider level** per episode.

## Mechanism

1. Fetch episode providers via `POST /api/sources/anime`
2. Each source has a `language` field: `VF`, `VOSTFR`, `MULTI`, `VO`, etc.
3. Filter providers by desired language before stream extraction

## Example providers for Naruto S1E1

```json
[
  { "host": "vidmoly", "language": "VOSTFR", "url": "https://vidmoly.org/embed-....html" },
  { "host": "vidmoly", "language": "VF", "url": "https://vidmoly.org/embed-....html" },
  { "host": "sibnet", "language": "VF", "url": "https://video.sibnet.ru/shell.php?videoid=..." }
]
```

## POC Implementation

`poc/sources.js` accepts an optional language filter and falls back to all providers if none match.

### Usage

```sh
node poc/sources.js 997 1 1
node poc/sources.js 997 1 1 VOSTFR
```

---

**Navigation:** [← Chapter 2](02-catalog-structure.md) · [Chapter 4 — Episode List & Providers Analysis →](04-episodes-providers.md)
