# Chapter 3: Language Discovery Analysis

Languages are not discovered by probing — they are declared explicitly in each season's `lang` object.

## Structure

Each season (or kai entry) contains:

```json
"lang": {
  "vf": [ /* provider arrays */ ],
  "vostfr": [ /* provider arrays */ ]
}
```

- Each **language key** (`vf`, `vostfr`) maps to an array of **providers**.
- Each **provider** is an array of embed URLs, one per episode (0-based index).

## Multiple providers per language

Naruto Saison 1 example:

| Language | Providers | Episodes per provider |
|----------|-----------|----------------------|
| VF | 2 (Vidmoly + Sibnet) | 220 |
| VOSTFR | 2 (Vidmoly + Sibnet) | 220 |

## POC Implementation

`poc/sources.js` reads the `lang` map and picks the requested language, falling back to `vostfr` then `vf`.

### Usage

```sh
node poc/sources.js naruto 1 1 vostfr
node poc/sources.js naruto 1 1 vf
```

---

**Navigation:** [← Chapter 2](02-catalog-structure.md) · [Chapter 4 — Episode List & Providers Analysis →](04-episodes-providers.md)
