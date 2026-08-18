# Nakanime Scraping POC

> Part of the [POC Anime Scraping](../README.md) monorepo.

Research and Proof of Concept focused on reverse-engineering **Nakanime** (`nakanime.tv`).

## Purpose

- **Catalog Research**: Explore how anime, seasons, episodes, and providers are indexed via a custom JSON API.
- **Scraping POC**: Lightweight scripts with offline XOR decryption — no browser needed for catalog/search.
- **Stream Analysis**: Investigate how streams from Vidmoly, Sibnet, VOE, OK.ru are embedded and extracted.

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
| [Chapter 5](docs/05-api-decryption.md) | API XOR Decryption | `poc/crypto.js` |
| [Chapter 6](docs/06-stream-extraction.md) | Video Stream Extraction | `poc/extract.js` |

## Scraping Pipeline

```
search.js → details.js → sources.js → extract.js
```

| Step | Input | Output |
|------|-------|--------|
| Search | query | anime IDs + slugs |
| Catalog | anime id/slug | seasons + episodes |
| Languages | episode sources | VF / VOSTFR / MULTI |
| Episodes & Providers | anime_id + episode_id | provider embed URLs |
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
node poc/details.js 997 1 1
node poc/sources.js 997 1 1 VOSTFR
node poc/extract.js "https://vidmoly.org/embed-y2dfh1ndem54.html"
```

For protected providers (VOE, OK.ru), install Playwright:

```bash
cd nakanime && npm install
node demo/index.js "naruto" 1 1 VF 3
```

## Disclaimer

This POC is for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
