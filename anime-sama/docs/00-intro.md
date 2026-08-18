# Introduction

Research and Proof of Concept focused on reverse-engineering **Anime-Sama** (`anime-sama.to`).

## What is Anime-Sama?

**Anime-Sama** is a popular French community platform for anime cataloging and streaming. It provides:

- **Anime** in VOSTFR (original audio, French subtitles) and VF (French dub).
- **Manga scans** for direct reading.

The platform **does not host video files**. It indexes content and embeds third-party video players inside iframes.

## What is a Video Provider?

A **Video Provider** (or video hoster) is an external service that stores and streams the actual video files. When you watch an episode, the site loads a player from one of these providers.

Common providers on Anime-Sama:

| Provider | Domain | Stream format |
|----------|--------|---------------|
| Vidmoly | `vidmoly.to` / `vidmoly.biz` | HLS (`.m3u8`) |
| Sendvid | `sendvid.com` | MP4 |
| Sibnet | `video.sibnet.ru` | MP4 |

## Architecture Overview

Anime-Sama uses a **PHP template** with client-side JavaScript for catalogue navigation. Search, season panels, language buttons, and episode lists are all exposed through predictable URL patterns and JS files — no browser automation required.

## The Scraping Pipeline

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 1 | [Search Engine Analysis](01-search-engine.md) | `search.js` | search query | list of matching animes |
| 2 | [Catalog Structure Analysis](02-catalog-structure.md) | `extract.js` | anime page URL | seasons, movies, scans |
| 3 | [Language Discovery Analysis](03-language-discovery.md) | `languages.js` | season URL | available languages (VF, VOSTFR, …) |
| 4 | [Episode List & Providers Analysis](04-episodes-providers.md) | `episodes.js` | season + language URL | episode lists per provider |
| 5 | [Video Stream Extraction](05-stream-extraction.md) | `vidmoly.js` | provider embed URL | direct stream URL (`.m3u8` / `.mp4`) |

## Documentation

| Chapter | Topic |
|---------|-------|
| **Introduction** | Platform overview & pipeline (this page) |
| [Chapter 1](01-search-engine.md) | Search Engine Analysis |
| [Chapter 2](02-catalog-structure.md) | Catalog Structure Analysis |
| [Chapter 3](03-language-discovery.md) | Language Discovery Analysis |
| [Chapter 4](04-episodes-providers.md) | Episode List & Providers Analysis |
| [Chapter 5](05-stream-extraction.md) | Video Stream Extraction |

---

**Navigation:** [Chapter 1 — Search Engine Analysis →](01-search-engine.md)
