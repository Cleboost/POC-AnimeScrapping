# Chapter 1: Search Engine Analysis

FRAnime does not expose a dedicated search endpoint. The entire catalogue is loaded once and filtered client-side in the browser.

## Endpoint

- **URL**: `https://api.franime.fr/api/animes`
- **Method**: `GET`
- **Required headers**: `Origin: https://franime.fr`, `Referer: https://franime.fr/`

## Mechanism

The endpoint returns a JSON array of every anime in the catalogue. Each object contains:

- `id`: unique anime identifier (used in all subsequent API calls).
- `titleO`: original title.
- `titles`: object with `en`, `en_jp`, `ja_jp` variants.
- `affiche` / `affiche_small`: cover image URLs.
- `format`, `status`, `note`: metadata.

The Next.js site fetches this list on mount and filters locally — **one API call gives us the full catalogue**.

## POC Implementation

The script `poc/search.js` implements this by:

1. Fetching the full catalogue from `/api/animes`.
2. Lowercasing the query and filtering on all title variants (`titleO`, `titles.en`, `titles.en_jp`, `titles.ja_jp`).
3. Returning a clean JSON array with only the fields needed for the next step.

### Example output for query `"rezero"`

```json
[
  {
    "id": "517396000974",
    "title": "Re:ZERO -Starting Life in Another World-",
    "titleO": "Re:ゼロから始める異世界生活",
    "format": "TV",
    "status": "Terminé",
    "note": 4.8
  }
]
```

### Usage

```sh
node poc/search.js "rezero"
```

---

**Navigation:** [← Introduction](00-intro.md) · [Chapter 2 — Catalog Structure Analysis →](02-catalog-structure.md)
