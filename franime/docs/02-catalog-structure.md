# Chapter 2: Catalog Structure Analysis

Once an anime ID is known, its full structure (seasons, episodes) is available from a single API call.

## Endpoint

- **URL**: `https://api.franime.fr/api/anime-by-id/:id`
- **Method**: `GET`
- **Required headers**: `Origin: https://franime.fr`, `Referer: https://franime.fr/`

## Mechanism

The response is a rich JSON object describing the entire anime:

- `saisons[]`: array of seasons, each with a `title` and `episodes[]`.
- Each episode has a `title` and a `lang` object (detailed in Chapters 3 and 4).

### Index conventions

All indices used in subsequent API calls are **0-based**:

| Index | Description |
|-------|-------------|
| `saisonIndex` | Position in `saisons[]` |
| `episodeIndex` | Position in `episodes[]` |
| `lecteurIndex` | Position in `lecteurs[]` (Chapter 4) |

## POC Implementation

The script `poc/details.js` fetches and normalizes the catalogue structure with 0-based indices on every season and episode.

### Example output for ID `517396000974` (Re:Zero)

```json
{
  "id": "517396000974",
  "title": "Re:ZERO -Starting Life in Another World-",
  "saisons": [
    {
      "index": 0,
      "title": "Saison 1",
      "episodes": [
        { "index": 0, "title": "Épisode 1", "langs": { "vo": ["sibnet"], "vf": [] } }
      ]
    }
  ]
}
```

### Usage

```sh
node poc/details.js 517396000974
```

---

**Navigation:** [← Chapter 1](01-search-engine.md) · [Chapter 3 — Language Discovery Analysis →](03-language-discovery.md)
