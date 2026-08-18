# Chapter 1: Search Engine Analysis

Mugiwara exposes a lightweight JSON search endpoint. No HTML scraping required for discovery.

## Endpoint

- **URL**: `https://www.mugiwara-no-streaming.com/api/search?q=<query>`
- **Method**: `GET`
- **Headers**:
  - `Accept: application/json`
  - `Referer: https://www.mugiwara-no-streaming.com/`
  - `User-Agent: <Browser User Agent>`

## Response format

```json
{
  "results": [
    {
      "anime": "Naruto",
      "slug": "naruto",
      "synopsis": "...",
      "type": "Shonen",
      "category": ["Action", "Aventure"],
      "themes": ["Ninjas"],
      "matched": "Naruto",
      "affiche": "Affiche.jpg"
    }
  ]
}
```

## POC Implementation

The script `poc/search.js` calls the API and returns a clean result array with catalogue URLs and cover image paths.

### Usage

```sh
node poc/search.js "naruto"
```

---

**Navigation:** [← Introduction](00-intro.md) · [Chapter 2 — Catalog Structure Analysis →](02-catalog-structure.md)
