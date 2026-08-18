# Introduction

Research and Proof of Concept focused on reverse-engineering **VoirAnime** (`voir-anime.to`).

## What is VoirAnime?

**VoirAnime** is a popular French anime streaming platform. It provides a large library of anime in both VF (French dub) and VOSTFR (original audio with French subtitles).

The platform **does not host video files**. It indexes content and embeds third-party video players inside iframes.

## What is a Video Provider?

A **Video Provider** is an external service that stores and streams the actual video files. Episode pages expose multiple players (lecteurs) as iframe embeds.

Common providers on VoirAnime:

| Provider | Examples | Stream format |
|----------|----------|---------------|
| Vidmoly | `vidmoly.biz` | HLS (`.m3u8`) |
| Filemoon / MOON | `weneverbeenfree.com` | HLS (`.m3u8`) |
| VOE | `voe.sx` | HLS (`.m3u8`) |
| Streamtape | `streamtape.com` | MP4 |

## Architecture Overview

VoirAnime is built on **WordPress** using the **Madara** theme and the **Ajax Search Pro** plugin. Player embed URLs are available directly in the episode page source — there is no intermediate redirect layer.

Protected providers require **Playwright** (headful mode) to bypass Turnstile/PoW checks and domain-lock validation.

## The Scraping Pipeline

### Core steps (shared across all POCs)

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 1 | [Search Engine Analysis](01-search-engine.md) | `search.js` | search query | list of matching animes |
| 2 | [Catalog Structure Analysis](02-catalog-structure.md) | — | anime page URL | page structure overview |
| 3 | [Language Discovery Analysis](03-language-discovery.md) | — | search results | VF / VOSTFR page mapping |
| 4 | [Episode List & Providers Analysis](04-episodes-providers.md) | `details.js` | anime page URL | episodes + player embed URLs |

### Platform-specific steps

| Step | Chapter | Script | Input | Output |
|------|---------|--------|-------|--------|
| 5 | [Video Stream Extraction — HTTP](05-stream-extraction-http.md) | `extract.js` | embed URL | `.m3u8` (Vidmoly) |
| 6 | [Video Stream Extraction — Browser](06-stream-extraction-browser.md) | `extract.js` | embed + episode URL | `.m3u8` / `.mp4` (protected hosts) |

An integrated demo orchestrating all steps is available at `demo/index.js`.

## Documentation

| Chapter | Topic |
|---------|-------|
| **Introduction** | Platform overview & pipeline (this page) |
| [Chapter 1](01-search-engine.md) | Search Engine Analysis |
| [Chapter 2](02-catalog-structure.md) | Catalog Structure Analysis |
| [Chapter 3](03-language-discovery.md) | Language Discovery Analysis |
| [Chapter 4](04-episodes-providers.md) | Episode List & Providers Analysis |
| [Chapter 5](05-stream-extraction-http.md) | Video Stream Extraction — HTTP Providers |
| [Chapter 6](06-stream-extraction-browser.md) | Video Stream Extraction — Protected Providers *(VoirAnime-specific)* |

---

**Navigation:** [Chapter 1 — Search Engine Analysis →](01-search-engine.md)
