# Chapter 4: Episode List & Providers Analysis

Provider embed URLs are resolved server-side through a dedicated POST endpoint.

## Endpoint

- **URL**: `https://nakanime.tv/api/sources/anime`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `anime_id` | number | yes | Internal anime ID |
| `episode_id` | number | yes | Internal episode ID from `episodesList` |

> **Note**: `episode_number` alone returns an empty array. You must use the internal `episode_id`.

## Response

Encrypted JSON array of sources:

```json
[
  {
    "id": 303723,
    "url": "https://vidmoly.org/embed-y2dfh1ndem54.html",
    "host": "vidmoly",
    "language": "VOSTFR",
    "episodeId": 77317
  }
]
```

Embed URLs are **direct** — no intermediate redirect or XOR layer (unlike FRAnime's `/watch2/`).

## POC Implementation

`poc/sources.js` chains `details.js` (to resolve `episode_id`) with the sources API.

### Usage

```sh
node poc/sources.js 997 1 1
node poc/sources.js naruto 1 1 VF
```

---

**Navigation:** [← Chapter 3](03-language-discovery.md) · [Chapter 5 — API XOR Decryption →](05-api-decryption.md)
