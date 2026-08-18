# Chapter 1: Search Engine Analysis

Nakanime exposes a server-side search endpoint. The HTML catalogue page is a SPA shell — the actual search happens through the JSON API.

## Endpoint

- **URL**: `https://nakanime.tv/api/anime?q=<query>`
- **Method**: `GET`
- **Headers**:
  - `Accept: application/json`
  - `Referer: https://nakanime.tv/`
  - `User-Agent: <Browser User Agent>`

## Response format

The response is **encrypted** (`content-type: application/octet-stream`, `x-enc: 1`). See [Chapter 5](05-api-decryption.md) for decryption.

Decrypted payload structure:

```json
{
  "pageInfo": {
    "total": 16,
    "currentPage": 1,
    "lastPage": 1,
    "perPage": 20,
    "hasNextPage": false
  },
  "media": [
    {
      "id": 997,
      "slug": "naruto",
      "title": {
        "romaji": "NARUTO",
        "english": "Naruto",
        "userPreferred": "Naruto"
      },
      "format": "TV",
      "status": "Ended",
      "episodes": 220,
      "seasonYear": 2002,
      "averageScore": 80
    }
  ]
}
```

## POC Implementation

The script `poc/search.js` calls the API, decrypts the payload, and returns a clean result array.

### Usage

```sh
node poc/search.js "naruto"
```

---

**Navigation:** [← Introduction](00-intro.md) · [Chapter 2 — Catalog Structure Analysis →](02-catalog-structure.md)
