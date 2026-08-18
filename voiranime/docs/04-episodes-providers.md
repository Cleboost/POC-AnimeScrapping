# Chapter 4: Episode List & Providers Analysis

Once an anime page URL is known, we parse the HTML to extract the episode list and video player embed URLs.

## Episode List Extraction

On the anime detail page (e.g. `https://voir-anime.to/anime/solo-leveling-2-vf/`), episodes are listed as list items.

Parsing regex:

```javascript
/<li class="wp-manga-chapter\s*[^"]*">\s*<a href="([^"]+)">\s*([\s\S]*?)\s*<\/a>/g
```

The parsed list is reversed so it starts chronologically from Episode 1.

## Video Player Embeds

On each episode page (e.g. `/solo-leveling-2-13-vf/`), the server inserts all available player iframe configurations in a JavaScript block:

```html
<script>
var thisChapterSources = {
  "LECTEUR myTV": "<iframe src=\"https:\/\/vidmoly.biz\/embed-n5n33nx6y8el.html\" ...><\/iframe>",
  "LECTEUR MOON": "<iframe src=\"https:\/\/weneverbeenfree.com\/e\/khqbg52e6bci\" ...><\/iframe>",
  "LECTEUR VOE": "<iframe src=\"https:\/\/voe.sx\/e\/vjghgoofhafe\" ...><\/iframe>"
};
</script>
```

The script extracts this object via regex on `var thisChapterSources = ({[^}]+});`, parses it as JSON, and extracts the `src` attribute from each iframe.

## POC Implementation

The script `poc/details.js` orchestrates both steps:

1. Fetches the anime page and extracts the episode list.
2. For each episode, fetches the page and extracts `thisChapterSources` player embeds.

### Usage

```sh
node poc/details.js "https://voir-anime.to/anime/solo-leveling-2-vf/"
```

---

**Navigation:** [← Chapter 3](03-language-discovery.md) · [Chapter 5 — Video Stream Extraction (HTTP) →](05-stream-extraction-http.md)
