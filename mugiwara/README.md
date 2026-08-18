# Mugiwara-no Streaming Scraping POC

> Part of the [POC Anime Scraping](../README.md) monorepo.

Research and Proof of Concept focused on reverse-engineering **Mugiwara-no Streaming** (`mugiwara-no-streaming.com`).

## Purpose

- **Catalog Research**: Explore how anime, seasons, episodes, and providers are indexed via a Next.js app with embedded RSC payloads.
- **Scraping POC**: Lightweight scripts — no browser needed for search, catalog, and provider resolution.
- **Stream Analysis**: Investigate how streams from Vidmoly, Sibnet, Sendvid, and other hosts are embedded and extracted.

## Documentation

### Core steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Introduction](docs/00-intro.md) | Platform overview & pipeline | — |
| [Chapter 1](docs/01-search-engine.md) | Search Engine Analysis | `poc/search.js` |
| [Chapter 2](docs/02-catalog-structure.md) | Catalog Structure Analysis | `poc/details.js` |
| [Chapter 3](docs/03-language-discovery.md) | Language Discovery Analysis | `poc/sources.js` |
| [Chapter 4](docs/04-episodes-providers.md) | Episode List & Providers Analysis | `poc/sources.js` |

### Platform-specific steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Chapter 5](docs/05-rsc-parsing.md) | Next.js RSC Payload Parsing | `poc/parse.js` |
| [Chapter 6](docs/06-stream-extraction.md) | Video Stream Extraction | `poc/extract.js` |

## Scraping Pipeline

```
search.js → details.js → sources.js → extract.js
```

| Step | Input | Output |
|------|-------|--------|
| Search | query | anime slugs + metadata |
| Catalog | slug | seasons + languages |
| Languages | season lang map | VF / VOSTFR |
| Episodes & Providers | slug + season + episode | provider embed URLs |
| Stream | embed URL | `.m3u8` / `.mp4` |

An integrated demo is available at `demo/index.js`.

## Quick Start

Catalog steps need only plain Node.js — no npm dependencies.

```bash
node demo/index.js "naruto"
```

Individual scripts:

```bash
node poc/search.js "naruto"
node poc/details.js naruto 1
node poc/sources.js naruto 1 1 vostfr
node poc/extract.js "https://vidmoly.to/embed-xxxxx.html"
```

For protected providers, install Playwright:

```bash
cd mugiwara && npm install
node demo/index.js "naruto" 1 1 vostfr 2
```

## Disclaimer

This POC is for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
