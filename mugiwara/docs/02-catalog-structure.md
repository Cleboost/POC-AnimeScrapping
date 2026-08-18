# Chapter 2: Catalog Structure Analysis

Anime metadata, seasons, and provider URL matrices are embedded in the catalogue page HTML as escaped JSON inside Next.js RSC payloads.

## Page URLs

| Page | URL pattern |
|------|-------------|
| Catalogue | `/catalogue/{slug}` |
| Season episodes | `/catalogue/{slug}/episodes/saison{id}` |
| Kai | `/catalogue/{slug}/episodes/kai` |

Examples:

- `https://www.mugiwara-no-streaming.com/catalogue/naruto`
- `https://www.mugiwara-no-streaming.com/catalogue/naruto/episodes/saison1`
- `https://www.mugiwara-no-streaming.com/catalogue/naruto/episodes/saison1hs`
- `https://www.mugiwara-no-streaming.com/catalogue/naruto/episodes/kai`

## Catalogue JSON shape (simplified)

```json
{
  "slug": "naruto",
  "anime": "Naruto",
  "synopsis": "...",
  "type": "Shonen",
  "options": {
    "affiche": "Affiche.jpg",
    "saisons": [
      {
        "id": "1",
        "name": "Naruto",
        "image": "Saisons/Saison1.webp",
        "lang": {
          "vf": [
            ["https://vidmoly.to/embed-xxx.html", "...episode 2...", "..."]
          ],
          "vostfr": [
            ["https://video.sibnet.ru/shell.php?videoid=...", "..."]
          ]
        }
      }
    ],
    "kai": [
      {
        "id": "kai",
        "name": "Naruto",
        "lang": { "vf": [[...]], "vostfr": [[...]] }
      }
    ]
  }
}
```

## Season IDs

Season `id` values are **strings** and map directly to URL paths:

| `id` | URL suffix | Example name |
|------|------------|--------------|
| `1` | `saison1` | Naruto |
| `1hs` | `saison1hs` | Naruto (sans fillers) |
| `kai` | `kai` | Naruto KAI |

## Episode names

Episode titles are embedded separately on season pages:

```json
{ "name": "Et voici Naruto Uzumaki", "index": 1 }
```

## POC Implementation

`poc/details.js` fetches the catalogue page, parses the embedded JSON, and optionally loads episode names from the season page.

### Usage

```sh
node poc/details.js naruto
node poc/details.js naruto 1
node poc/details.js naruto 1 1
```

---

**Navigation:** [← Chapter 1](01-search-engine.md) · [Chapter 3 — Language Discovery Analysis →](03-language-discovery.md)
