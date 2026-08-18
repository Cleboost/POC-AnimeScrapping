# FRAnime Scraping POC

> Part of the [POC Anime Scraping](../README.md) monorepo.

Research and Proof of Concept focused on reverse-engineering **FRAnime** (`franime.fr`).

## Purpose

- **Catalog Research**: Explore how anime, seasons, languages, and providers are indexed via REST API.
- **Scraping POC**: Lightweight scripts with offline XOR decryption — zero browser, zero npm deps.
- **Stream Analysis**: Investigate how streams from Vidmoly, Sibnet, Sendvid, Filemoon are embedded and extracted.

## Documentation

### Core steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Introduction](docs/00-intro.md) | Platform overview & pipeline | — |
| [Chapter 1](docs/01-search-engine.md) | Search Engine Analysis | `poc/search.js` |
| [Chapter 2](docs/02-catalog-structure.md) | Catalog Structure Analysis | `poc/details.js` |
| [Chapter 3](docs/03-language-discovery.md) | Language Discovery Analysis | `poc/details.js` |
| [Chapter 4](docs/04-episodes-providers.md) | Episode List & Providers Analysis | `poc/details.js` |

### Platform-specific steps

| Chapter | Topic | Script |
|---------|-------|--------|
| [Chapter 5](docs/05-provider-url-resolution.md) | Provider URL Resolution | `poc/stream.js` |
| [Chapter 6](docs/06-watch2-decryption.md) | Watch2 XOR Decryption | `poc/watch2.js` |
| [Chapter 7](docs/07-stream-extraction.md) | Video Stream Extraction | `poc/extract.js` |

## Scraping Pipeline

```
search.js → details.js → stream.js → watch2.js → extract.js
```

| Step | Input | Output |
|------|-------|--------|
| Search | query | anime IDs |
| Catalog | anime ID | seasons, episodes |
| Languages | anime ID | vo / vf lecteurs |
| Episodes & Providers | indices | provider selection |
| Provider URL | indices + lang | `/watch2/` URL |
| Watch2 | `/watch2/` URL | provider embed URL |
| Stream | embed URL | `.m3u8` / `.mp4` |

An integrated demo is available at `demo/index.js`.

## Quick Start

Most steps need only plain Node.js — no npm dependencies.

```bash
node demo/index.js "rezero"
```

Individual scripts:

```bash
node poc/search.js "rezero"
node poc/details.js 517396000974
node poc/stream.js 517396000974 0 0 vo 0
node poc/watch2.js "https://franime.fr/watch2/?a=..."
node poc/extract.js "https://video.sibnet.ru/shell.php?videoid=4956170"
```

## Disclaimer

This POC is for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
