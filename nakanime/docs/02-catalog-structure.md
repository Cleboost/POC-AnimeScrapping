# Chapter 2: Catalog Structure Analysis

Anime metadata, seasons, and the full episode list are returned by a single API call.

## Endpoint

- **URL**: `https://nakanime.tv/api/anime/{id}` or `/api/anime/{slug}`
- **Method**: `GET`
- **Response**: encrypted JSON (see [Chapter 5](05-api-decryption.md))

## Key fields

| Field | Description |
|-------|-------------|
| `id` | Internal anime ID (used in API calls) |
| `slug` | URL slug (`naruto`) |
| `title` | Object with `romaji`, `english`, `userPreferred` |
| `episodes` | Total episode count |
| `seasons` | Array of `{ id, number, name }` |
| `episodesList` | Full episode list with internal IDs |

## Episode list entry

```json
{
  "id": 77317,
  "number": 1,
  "title": "Et voici Naruto Uzumaki",
  "isFiller": false,
  "seasonId": 4251,
  "thumbnailUrl": "https://image.tmdb.org/t/p/w300/..."
}
```

## Watch page URL pattern

```
/anime/{animeId}/season/{seasonNumber}/episode/{episodeNumber}
```

Example: `https://nakanime.tv/anime/997/season/1/episode/1`

## POC Implementation

`poc/details.js` fetches anime metadata and maps episodes with their internal `episode_id`.

### Usage

```sh
node poc/details.js 997
node poc/details.js 997 1 1
```

---

**Navigation:** [← Chapter 1](01-search-engine.md) · [Chapter 3 — Language Discovery Analysis →](03-language-discovery.md)
