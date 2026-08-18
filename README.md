# POC Anime Scraping

Monorepo gathering all reverse-engineering / scraping POCs for French anime streaming platforms.

Each subdirectory was previously a standalone repository, with its own docs and scripts.

## Projects

| Platform | Directory | Chapters | Former repo |
|----------|-----------|----------|-------------|
| **Anime-Sama** | [`anime-sama/`](anime-sama/) | 5 + intro | [POC-Anime-Sama-Scrapping](https://github.com/Cleboost/POC-Anime-Sama-Scrapping) |
| **VoirAnime** | [`voiranime/`](voiranime/) | 6 + intro | [POC-VoirAnime-Scrapping](https://github.com/Cleboost/POC-VoirAnime-Scrapping) |
| **FRAnime** | [`franime/`](franime/) | 7 + intro | [POC-FrAnime-Scrapping](https://github.com/Cleboost/POC-FrAnime-Scrapping) |

## Shared Pipeline Steps

Every POC follows the same core steps. Additional chapters are added when a platform requires extra resolution layers or provider-specific techniques.

| Step | Chapter title | Anime-Sama | VoirAnime | FRAnime |
|------|---------------|:----------:|:---------:|:-------:|
| — | Introduction | ✓ | ✓ | ✓ |
| 1 | Search Engine Analysis | ✓ | ✓ | ✓ |
| 2 | Catalog Structure Analysis | ✓ | ✓ | ✓ |
| 3 | Language Discovery Analysis | ✓ | ✓ | ✓ |
| 4 | Episode List & Providers Analysis | ✓ | ✓ | ✓ |
| 5+ | *Platform-specific steps* | Video Stream Extraction | Stream Extraction (HTTP) | Provider URL Resolution |
| | | | Stream Extraction (Browser) | Watch2 XOR Decryption |
| | | | | Video Stream Extraction |

See each project's README for scripts, pipeline details, and full documentation index.

## Structure

```
anime-sama/   → poc/, docs/, demo/   (no npm dependencies)
voiranime/    → poc/, docs/, demo/   (playwright)
franime/      → poc/, docs/, demo/   (plain Node.js)
```

## Quick Start

**Anime-Sama** (plain Node.js, no `npm install` required):

```bash
node anime-sama/poc/search.js "one piece"
```

**VoirAnime** (requires Playwright for protected providers):

```bash
cd voiranime && npm install && node demo/index.js "rezero"
```

**FRAnime** (plain Node.js):

```bash
node franime/demo/index.js "rezero"
```

## Disclaimer

These POCs are for **educational and research purposes only**. Please respect the terms of service of the analyzed platforms.
