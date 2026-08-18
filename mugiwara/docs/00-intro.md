# Introduction

Research and Proof of Concept focused on reverse-engineering **Mugiwara-no Streaming** (`mugiwara-no-streaming.com`).

## What is Mugiwara-no Streaming?

**Mugiwara-no Streaming** is a French anime streaming platform built with **Next.js**. It offers a large catalogue in VF and VOSTFR, plus scans and films.

The platform **does not host video files**. It indexes content and embeds third-party players (Vidmoly, Sibnet, Sendvid, etc.).

## What is a Video Provider?

A **Video Provider** is an external service that stores and streams the actual video files. Mugiwara exposes provider embed URLs directly inside the catalogue JSON embedded in page HTML.

Common providers on Mugiwara:

| Provider | Domain | Stream format |
|----------|--------|---------------|
| Vidmoly | `vidmoly.to` | HLS (`.m3u8`) |
| Sibnet | `video.sibnet.ru` | MP4 |
| Sendvid | `sendvid.com` | varies |
| Filemoon | `filemoon.*` | HLS (`.m3u8`) |

## Architecture Overview

Mugiwara is a **Next.js App Router** site. Key architectural details:

- **Search API**: plain JSON at `/api/search?q=<query>`.
- **Catalog data**: embedded in React Server Components (RSC) flight payloads inside HTML pages — not a separate public JSON API.
- **Episode routing**: `/catalogue/{slug}/episodes/saison{id}` (e.g. `saison1`, `saison1hs`, `kai`).
- **Provider resolution**: embed URLs are stored per season, per language, per provider index — no redirect layer like FRAnime's `/watch2/`.

## The Scraping Pipeline

### Core steps (shared across all POCs)

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 1 | [Search Engine Analysis](01-search-engine.md) | `search.js` | search query | list of animes with slugs |
| 2 | [Catalog Structure Analysis](02-catalog-structure.md) | `details.js` | slug | seasons, episode names |
| 3 | [Language Discovery Analysis](03-language-discovery.md) | `sources.js` | season lang map | VF / VOSTFR |
| 4 | [Episode List & Providers Analysis](04-episodes-providers.md) | `sources.js` | slug + season + episode | provider embed URLs |

### Platform-specific steps

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 5 | [Next.js RSC Payload Parsing](05-rsc-parsing.md) | `parse.js` | HTML page | catalogue JSON |
| 6 | [Video Stream Extraction](06-stream-extraction.md) | `extract.js` | embed URL | direct stream URL |

An integrated demo orchestrating all steps is available at `demo/index.js`.

## Documentation

| Chapter | Topic |
|---------|-------|
| **Introduction** | Platform overview & pipeline (this page) |
| [Chapter 1](01-search-engine.md) | Search Engine Analysis |
| [Chapter 2](02-catalog-structure.md) | Catalog Structure Analysis |
| [Chapter 3](03-language-discovery.md) | Language Discovery Analysis |
| [Chapter 4](04-episodes-providers.md) | Episode List & Providers Analysis |
| [Chapter 5](05-rsc-parsing.md) | Next.js RSC Payload Parsing *(Mugiwara-specific)* |
| [Chapter 6](06-stream-extraction.md) | Video Stream Extraction |

---

**Navigation:** [Chapter 1 — Search Engine Analysis →](01-search-engine.md)
