# Introduction

Research and Proof of Concept focused on reverse-engineering **FRAnime** (`franime.fr`).

## What is FRAnime?

**FRAnime** is a popular French anime streaming platform. It provides a large library of:

- **Anime** in VOSTFR and VF.
- **Various formats**: TV series, films, OVAs, ONAs.

The platform **does not host video files**. It indexes content and embeds third-party video players inside iframes.

## What is a Video Provider?

A **Video Provider** is an external service that stores and streams the actual video files. FRAnime resolves provider embed URLs through an obfuscated `/watch2/` redirect layer.

Common providers on FRAnime:

| Provider | Domain | Stream format |
|----------|--------|---------------|
| Vidmoly | `vidmoly.biz` | HLS (`.m3u8`) |
| Sibnet | `video.sibnet.ru` | MP4 |
| Sendvid | `sendvid.com` | MP4 |
| Filemoon | various | HLS (`.m3u8`) |

## Architecture Overview

FRAnime is built with **Next.js App Router** and communicates with a REST API at `api.franime.fr`.

Key architectural details:

- **Client-side search**: the entire catalogue is fetched once and filtered in the browser — no server-side search endpoint.
- **Cloudflare protection**: most API endpoints are accessible with correct `Origin` and `Referer` headers.
- **Watch2 obfuscation**: provider URLs are encoded in `/watch2/` redirect links, decrypted offline via XOR brute-force (no browser needed).

## The Scraping Pipeline

### Core steps (shared across all POCs)

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 1 | [Search Engine Analysis](01-search-engine.md) | `search.js` | search query | list of animes with IDs |
| 2 | [Catalog Structure Analysis](02-catalog-structure.md) | `details.js` | anime ID | seasons, episodes |
| 3 | [Language Discovery Analysis](03-language-discovery.md) | `details.js` | anime ID | available languages & lecteurs |
| 4 | [Episode List & Providers Analysis](04-episodes-providers.md) | `details.js` | indices | episode + provider selection |

### Platform-specific steps

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 5 | [Provider URL Resolution](05-provider-url-resolution.md) | `stream.js` | indices + lang | `/watch2/` URL |
| 6 | [Watch2 XOR Decryption](06-watch2-decryption.md) | `watch2.js` | `/watch2/` URL | provider embed URL |
| 7 | [Video Stream Extraction](07-stream-extraction.md) | `extract.js` | embed URL | direct stream URL |

An integrated demo orchestrating all steps is available at `demo/index.js`.

## Documentation

| Chapter | Topic |
|---------|-------|
| **Introduction** | Platform overview & pipeline (this page) |
| [Chapter 1](01-search-engine.md) | Search Engine Analysis |
| [Chapter 2](02-catalog-structure.md) | Catalog Structure Analysis |
| [Chapter 3](03-language-discovery.md) | Language Discovery Analysis |
| [Chapter 4](04-episodes-providers.md) | Episode List & Providers Analysis |
| [Chapter 5](05-provider-url-resolution.md) | Provider URL Resolution *(FRAnime-specific)* |
| [Chapter 6](06-watch2-decryption.md) | Watch2 XOR Decryption *(FRAnime-specific)* |
| [Chapter 7](07-stream-extraction.md) | Video Stream Extraction |

---

**Navigation:** [Chapter 1 — Search Engine Analysis →](01-search-engine.md)
