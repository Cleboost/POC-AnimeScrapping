# Introduction

Research and Proof of Concept focused on reverse-engineering **Nakanime** (`nakanime.tv`).

## What is Nakanime?

**Nakanime** is a French anime streaming platform with a modern SPA frontend. It provides a large catalogue in VF, VOSTFR, and sometimes MULTI.

The platform **does not host video files**. It indexes content (metadata from AniList/TMDB) and embeds third-party players.

## What is a Video Provider?

A **Video Provider** is an external service that stores and streams the actual video files. Nakanime exposes provider embed URLs through its `/api/sources/anime` endpoint.

Common providers on Nakanime:

| Provider | Domain | Stream format |
|----------|--------|---------------|
| Vidmoly | `vidmoly.org` | HLS (`.m3u8`) |
| Sibnet | `video.sibnet.ru` | MP4 |
| VOE | various mirrors | HLS (`.m3u8`) |
| OK.ru | `my.mail.ru` | varies |

## Architecture Overview

Nakanime is a **custom SPA** (Vite + AdonisJS backend). Key architectural details:

- **Encrypted API**: most endpoints return `application/octet-stream` with header `x-enc: 1`.
- **Offline decryption**: responses are XOR-encrypted with a key derived from the request path (`nkapiv1` + path).
- **Episode routing**: watch pages use `/anime/{id}/season/{n}/episode/{n}`.
- **Provider resolution**: embed URLs are returned directly by the sources API — no redirect layer like FRAnime's `/watch2/`.

## The Scraping Pipeline

### Core steps (shared across all POCs)

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 1 | [Search Engine Analysis](01-search-engine.md) | `search.js` | search query | list of animes with IDs |
| 2 | [Catalog Structure Analysis](02-catalog-structure.md) | `details.js` | anime id/slug | seasons, episodes |
| 3 | [Language Discovery Analysis](03-language-discovery.md) | `sources.js` | episode id | available languages |
| 4 | [Episode List & Providers Analysis](04-episodes-providers.md) | `sources.js` | anime_id + episode_id | provider embed URLs |

### Platform-specific steps

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 5 | [API XOR Decryption](05-api-decryption.md) | `crypto.js` | encrypted buffer + path | JSON payload |
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
| [Chapter 5](05-api-decryption.md) | API XOR Decryption *(Nakanime-specific)* |
| [Chapter 6](06-stream-extraction.md) | Video Stream Extraction |

---

**Navigation:** [Chapter 1 — Search Engine Analysis →](01-search-engine.md)
