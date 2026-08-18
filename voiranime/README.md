# VoirAnime Scraping POC

> Part of the [POC Anime Scraping](../README.md) monorepo.

Research and Proof of Concept focused on reverse-engineering **VoirAnime** (`voir-anime.to`).

## Purpose

- **Catalog Research**: Explore how anime, episodes, and video players are indexed on WordPress/Madara.
- **Scraping POC**: Lightweight scripts with Playwright for protected providers.
- **Stream Analysis**: Investigate how streams from Vidmoly, Filemoon/MOON, VOE, Streamtape are embedded and extracted.

## Documentation

### Core steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Introduction](docs/00-intro.md) | Platform overview & pipeline | — |
| [Chapter 1](docs/01-search-engine.md) | Search Engine Analysis | `poc/search.js` |
| [Chapter 2](docs/02-catalog-structure.md) | Catalog Structure Analysis | — |
| [Chapter 3](docs/03-language-discovery.md) | Language Discovery Analysis | — |
| [Chapter 4](docs/04-episodes-providers.md) | Episode List & Providers Analysis | `poc/details.js` |

### Platform-specific steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Chapter 5](docs/05-stream-extraction-http.md) | Video Stream Extraction — HTTP Providers | `poc/extract.js` |
| [Chapter 6](docs/06-stream-extraction-browser.md) | Video Stream Extraction — Protected Providers | `poc/extract.js` |

## Scraping Pipeline

```
search.js → details.js → extract.js
```

| Step | Input | Output |
|------|-------|--------|
| Search | query | anime page URLs |
| Catalog | anime URL | page structure |
| Languages | search results | VF / VOSTFR mapping |
| Episodes & Providers | anime URL | episodes + embed URLs |
| Stream (HTTP) | Vidmoly embed | `.m3u8` |
| Stream (Browser) | protected embed + episode URL | `.m3u8` / `.mp4` |

An integrated demo is available at `demo/index.js`.

## Quick Start

Requires Playwright (headful mode for protected providers).

```bash
npm install
node demo/index.js "rezero"
```

Individual scripts:

```bash
node poc/search.js "rezero"
node poc/details.js "https://voir-anime.to/anime/rezero-kara-hajimeru-isekai-seikatsu-s3/"
node poc/extract.js "https://vidmoly.biz/embed-xxxxx.html" "https://voir-anime.to/anime/.../episode-page/"
```

## Disclaimer

This POC is for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
