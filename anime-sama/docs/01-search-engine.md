# Chapter 1: Search Engine Analysis

Anime-Sama uses a simple internal search engine to find series.

## Endpoint

- **URL**: `https://anime-sama.to/template-php/defaut/fetch.php`
- **Method**: `POST`
- **Payload**: `query=YOUR_SEARCH_TERM`

## Mechanism

The endpoint returns a raw HTML string containing `<a>` tags with the class `asn-search-result`. Each result contains:

- The URL of the anime.
- A cover image (hosted on GitHub raw content).
- A title and an optional subtitle.

## POC Implementation

The script `poc/search.js` implements this by:

1. Sending the POST request with the query.
2. Parsing the HTML response using a global regex.
3. Decoding HTML entities (e.g. `&#039;`) to ensure clean JSON output.

### Usage

```sh
node poc/search.js "one piece"
```

---

**Navigation:** [← Introduction](00-intro.md) · [Chapter 2 — Catalog Structure Analysis →](02-catalog-structure.md)
