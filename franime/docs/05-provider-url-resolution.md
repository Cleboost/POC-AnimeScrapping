# Chapter 5: Provider URL Resolution

FRAnime-specific step. Once episode and provider indices are known (Chapter 4), the API returns an obfuscated `/watch2/` redirect URL.

## Endpoint

- **URL**: `https://api.franime.fr/api/anime/:animeId/:saisonIndex/:episodeIndex/:lang/:lecteurIndex`
- **Method**: `GET`
- **Required headers**: `Origin: https://franime.fr`, `Referer: https://franime.fr/`
- **Response**: plain text — a `https://franime.fr/watch2/?a=...` URL.

## Mechanism

The API acts as a **lecteur resolver**. It takes the 0-based indices from the catalogue and returns an obfuscated redirect URL pointing to the actual video provider.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `animeId` | string | Anime ID from `search.js` |
| `saisonIndex` | integer (0-based) | Season index from `details.js` |
| `episodeIndex` | integer (0-based) | Episode index from `details.js` |
| `lang` | `vo` or `vf` | Language — must match an available lang |
| `lecteurIndex` | integer (0-based) | Provider index in `lecteurs[]` |

## POC Implementation

The script `poc/stream.js` builds the API URL from the five parameters and returns the plain-text `/watch2/` URL.

### Usage

```sh
node poc/stream.js 517396000974 0 0 vo 0
# → https://franime.fr/watch2/?a=...
```

---

**Navigation:** [← Chapter 4](04-episodes-providers.md) · [Chapter 6 — Watch2 XOR Decryption →](06-watch2-decryption.md)
