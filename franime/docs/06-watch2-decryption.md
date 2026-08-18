# Chapter 6: Watch2 XOR Decryption

FRAnime-specific step. The `/watch2/` URLs from Chapter 5 contain obfuscated parameters encoding the destination provider embed URL. We decrypt them offline — no browser needed.

## Mechanism

### Encryption

1. **Base64 + Hex encoding**: each query parameter is Base64-decoded, then interpreted as a hex string of encrypted bytes.
2. **Single-byte XOR key**: the payload is encrypted with a key between `0` and `255` (common values: `2`, `3`, `10`, `88`, `95`).

### Brute-force strategy

Since the key space is only 256 values, decryption is instant:

1. Parse all query parameters from the `/watch2/` URL.
2. Decode each parameter from Base64 → hex → binary buffer.
3. Try all 256 XOR keys on each buffer.
4. Validate: decrypted string must start with `http` and contain a known provider domain (`sibnet.ru`, `vidmoly`, `filemoon`, etc.).

This eliminates the need for headless browser automation at this step.

## POC Implementation

The script `poc/watch2.js` parses the `/watch2/` URL, runs the XOR brute-force, and returns the decrypted provider embed URL.

### Usage

```sh
node poc/watch2.js "https://franime.fr/watch2/?a=..."
# → https://video.sibnet.ru/shell.php?videoid=5622007
```

---

**Navigation:** [← Chapter 5](05-provider-url-resolution.md) · [Chapter 7 — Video Stream Extraction →](07-stream-extraction.md)
