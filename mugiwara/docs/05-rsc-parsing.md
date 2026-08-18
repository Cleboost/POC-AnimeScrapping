# Chapter 5: Next.js RSC Payload Parsing

Mugiwara does not expose a public catalogue API. The full `animeServer` object is embedded in HTML as escaped JSON inside React Server Components flight data.

## Where the data lives

When fetching `/catalogue/naruto`, the HTML contains a fragment like:

```
\"slug\":\"naruto\",\"anime\":\"Naruto\",...\"options\":{\"saisons\":[...]}
```

The JSON is **double-escaped** (backslash-quoted) because it is serialized inside an RSC payload string.

## Parsing strategy

1. Locate the slug marker: `\"slug\":\"naruto\"`
2. Walk backwards to the opening `{`
3. Brace-count to find the matching closing `}`
4. Unescape: `\\"` → `"`, `\\n` → newline
5. `JSON.parse()` the result

```javascript
function parseAnimeServer(html, slug) {
  const marker = `\\"slug\\":\\"${slug}\\"`;
  const idx = html.indexOf(marker);
  // ... brace counting + unescape + JSON.parse
}
```

## Episode names on season pages

Season pages (`/catalogue/naruto/episodes/saison1`) embed episode titles separately:

```
\"name\":\"Et voici Naruto Uzumaki\",\"index\":1
```

Regex extraction is sufficient — no full JSON parse needed.

## Cover images

Images are hosted on GitHub:

```
https://raw.githubusercontent.com/NOUSSS/mugiwara-no-streaming-images/main/Animes/{slug}/{affiche}
```

## POC Implementation

- `poc/parse.js` — RSC JSON extraction, season listing, host detection
- Used by `details.js` and `sources.js`

### Usage

```sh
node -e "const {fetchAnimeServer,listSeasonEntries}=require('./poc/parse'); fetchAnimeServer('naruto').then(d=>console.log(listSeasonEntries(d)))"
```

---

**Navigation:** [← Chapter 4](04-episodes-providers.md) · [Chapter 6 — Video Stream Extraction →](06-stream-extraction.md)
