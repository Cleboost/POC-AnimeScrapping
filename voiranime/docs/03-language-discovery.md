# Chapter 3: Language Discovery Analysis

VoirAnime does not expose language variants on a single anime page. Instead, **VF and VOSTFR are separate catalogue entries**.

## Mechanism

When searching, the Ajax Search Pro API returns distinct results for each language version:

| Search result title | Language | Example slug |
|---------------------|----------|--------------|
| `Solo Leveling 2 (VF)` | French dub | `/anime/solo-leveling-2-vf/` |
| `Solo Leveling 2` | VOSTFR | `/anime/solo-leveling-2/` |

Language is determined by:

1. **Title suffix**: `(VF)` indicates French dub.
2. **Separate slugs**: VF and VOSTFR versions have different WordPress post slugs.
3. **No probing needed**: unlike Anime-Sama, there is no URL probing step — pick the correct search result directly.

## Implications for Scraping

- Run `search.js` and filter results by title suffix or slug pattern.
- Each language version has its own episode list and player configuration.
- There is no per-episode language toggle — language is chosen at catalogue level.

---

**Navigation:** [← Chapter 2](02-catalog-structure.md) · [Chapter 4 — Episode List & Providers Analysis →](04-episodes-providers.md)
