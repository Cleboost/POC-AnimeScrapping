# Chapter 3: Language Discovery Analysis

One of the challenges of Anime-Sama is identifying which languages are actually available for a given season or movie.

## Mechanism

While the HTML includes buttons for all possible languages (VF, VOSTFR, VA, VCN, etc.), most are disabled or hidden via CSS classes (`hidden`).

The most reliable approach is **URL probing**. The site uses a consistent URL structure (e.g. `.../saison1/vf/` or `.../saison1/vostfr/`), so we can check the HTTP status code of each path.

## POC Implementation

The script `poc/languages.js` handles this by:

1. Defining a list of standard language identifiers (`vf`, `vostfr`, `va`, etc.).
2. Sending **HEAD requests** to the corresponding URLs.
3. Filtering out 404 responses and keeping 200 OK results.

### Findings for JJK Saison 1

| Language | Status |
|----------|--------|
| VOSTFR | ✅ 200 |
| VF | ✅ 200 |
| VA | ❌ 404 |
| VCN | ❌ 404 |

### Usage

```sh
node poc/languages.js "https://anime-sama.to/catalogue/jujutsu-kaisen/saison1/"
```

---

**Navigation:** [← Chapter 2](02-catalog-structure.md) · [Chapter 4 — Episode List & Providers Analysis →](04-episodes-providers.md)
