# Anime-Sama Scraping POC

> Part of the [POC Anime Scraping](../README.md) monorepo.

Research and Proof of Concept focused on reverse-engineering **Anime-Sama** (`anime-sama.to`).

## Purpose

- **Catalog Research**: Explore how anime, seasons, languages, and scans are indexed.
- **Scraping POC**: Lightweight, dependency-free Node.js scripts.
- **Stream Analysis**: Investigate how video streams from providers (Vidmoly, Sendvid, Sibnet) are embedded and extracted.

## Documentation

| Chapter | Topic | Script |
|---------|-------|--------|
| [Introduction](docs/00-intro.md) | Platform overview & pipeline | — |
| [Chapter 1](docs/01-search-engine.md) | Search Engine Analysis | `poc/search.js` |
| [Chapter 2](docs/02-catalog-structure.md) | Catalog Structure Analysis | `poc/extract.js` |
| [Chapter 3](docs/03-language-discovery.md) | Language Discovery Analysis | `poc/languages.js` |
| [Chapter 4](docs/04-episodes-providers.md) | Episode List & Providers Analysis | `poc/episodes.js` |
| [Chapter 5](docs/05-stream-extraction.md) | Video Stream Extraction | `poc/vidmoly.js` |

## Scraping Pipeline

```
search.js → extract.js → languages.js → episodes.js → vidmoly.js
```

| Step | Input | Output |
|------|-------|--------|
| Search | query | anime URLs |
| Catalog | anime URL | seasons, scans |
| Languages | season URL | available langs (VF, VOSTFR, …) |
| Episodes & Providers | season + lang URL | episode lists per provider |
| Stream | embed URL | `.m3u8` / `.mp4` |

## Quick Start

No dependencies required — plain Node.js.

```bash
node poc/search.js "one piece"
node poc/extract.js "https://anime-sama.to/catalogue/one-piece/"
node poc/languages.js "https://anime-sama.to/catalogue/one-piece/saison1/"
node poc/episodes.js "https://anime-sama.to/catalogue/one-piece/saison1/vostfr/"
node poc/vidmoly.js "https://vidmoly.biz/embed-xxxxx.html"
```

## Disclaimer

This POC is for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
