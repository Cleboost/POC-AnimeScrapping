# Chapter 5: API XOR Decryption

Nakanime encrypts most API responses to discourage casual scraping. The scheme is simple XOR with a deterministic 32-byte key.

## Response headers

| Header | Value | Meaning |
|--------|-------|---------|
| `content-type` | `application/octet-stream` | Encrypted binary payload |
| `x-enc` | `1` | Encryption enabled |

## Key derivation

```javascript
const SALT = "nkapiv1";

function deriveKey(path) {
  const input = SALT + path; // e.g. "nkapiv1/api/anime/997"
  const key = [];

  for (let round = 0; round < 32; round++) {
    let acc = 0;
    for (let i = 0; i < input.length; i++) {
      acc = (acc * 31 + input.charCodeAt(i) + round) & 0xff;
    }
    key.push(acc);
  }

  return key;
}
```

## Decryption

```javascript
function decryptJson(path, buffer) {
  const bytes = new Uint8Array(buffer);
  const key = deriveKey(path);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] ^= key[i % key.length];
  }

  return JSON.parse(new TextDecoder().decode(bytes));
}
```

## Important detail

The key is derived from the **exact request path** (including query string):

- `/api/anime?q=naruto` → key from `nkapiv1/api/anime?q=naruto`
- `/api/anime/997` → key from `nkapiv1/api/anime/997`

Using the wrong path produces garbage JSON.

## POC Implementation

- `poc/crypto.js` — standalone decryption functions
- `poc/api.js` — fetch wrapper with automatic decrypt

### Usage

```sh
node -e "const {nakanimeApi}=require('./poc/api'); nakanimeApi('/api/anime/997').then(d=>console.log(d.title))"
```

---

**Navigation:** [← Chapter 4](04-episodes-providers.md) · [Chapter 6 — Video Stream Extraction →](06-stream-extraction.md)
