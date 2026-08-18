# Chapter 3: Language Discovery Analysis

FRAnime exposes language availability directly in the catalogue API response — no URL probing required.

## Mechanism

Each episode in the `/api/anime-by-id/:id` response contains a `lang` object with two keys:

| Key | Meaning | Example lecteurs |
|-----|---------|------------------|
| `lang.vo` | Original version (VOSTFR) | `["sibnet", "vidmoly"]` |
| `lang.vf` | French dub | `["vidmoly"]` or `[]` |

An empty array means the language is not available for that episode.

The `lecteurs[]` array lists provider **names** (not URLs). These names map to indices used in the provider resolution step (Chapter 4).

## POC Implementation

Language discovery is handled by `poc/details.js` (Chapter 2). The output includes per-episode `langs.vo` and `langs.vf` arrays.

To pick a stream, choose:

1. A language key: `vo` or `vf` (must be non-empty).
2. A lecteur index: position in the chosen language's `lecteurs[]` array.

### Example

For Re:Zero S1E1:

```json
"langs": {
  "vo": ["sibnet"],
  "vf": []
}
```

Only `vo` with `lecteurIndex: 0` (sibnet) is available.

---

**Navigation:** [← Chapter 2](02-catalog-structure.md) · [Chapter 4 — Episode List & Providers Analysis →](04-episodes-providers.md)
