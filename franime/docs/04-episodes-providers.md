# Chapter 4: Episode List & Providers Analysis

With the catalogue structure (Chapter 2) and language mapping (Chapter 3), each episode exposes a list of available **lecteurs** (provider names). This chapter covers how to navigate episodes and pick the right provider index.

## Mechanism

For each episode in `details.js` output, the `langs` object maps languages to provider name arrays:

```json
{
  "index": 0,
  "title": "Épisode 1",
  "langs": {
    "vo": ["sibnet", "vidmoly"],
    "vf": ["vidmoly"]
  }
}
```

| Field | Meaning |
|-------|---------|
| `langs.vo` | VOSTFR providers, ordered by index |
| `langs.vf` | VF providers, ordered by index |
| `lecteurIndex: 0` | First provider in the chosen lang array |
| `lecteurIndex: 1` | Second provider, etc. |

Provider names (`sibnet`, `vidmoly`, `sendvid`, …) are **identifiers**, not URLs. Resolving them to embed URLs requires additional steps (Chapters 5 and 6).

## Selecting an Episode + Provider

To request a stream, you need five values:

| Parameter | Source |
|-----------|--------|
| `animeId` | `search.js` |
| `saisonIndex` | `details.js` → season `index` |
| `episodeIndex` | `details.js` → episode `index` |
| `lang` | `vo` or `vf` (must be non-empty) |
| `lecteurIndex` | Position in `langs[lang]` array |

### Common mistake

Using the provider **name** (`sibnet`) instead of its **index** (`0`) in the API call will fail. Always use the numeric index.

## POC Implementation

The script `poc/details.js` (same as Chapter 2) is the source of truth for episode and provider indices. No additional script is needed at this step.

### Usage

```sh
node poc/details.js 517396000974
# Pick: saisonIndex=0, episodeIndex=0, lang=vo, lecteurIndex=0 → sibnet
```

---

**Navigation:** [← Chapter 3](03-language-discovery.md) · [Chapter 5 — Provider URL Resolution →](05-provider-url-resolution.md)
