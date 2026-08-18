# Chapter 2: Catalog Structure Analysis

Once a search result is selected, the anime detail page follows a predictable WordPress / Madara structure.

## Page Structure

- **Base URL pattern**: `https://voir-anime.to/anime/{slug}/`
- **Episode URL pattern**: `https://voir-anime.to/anime/{slug}/{episode-slug}/`
- **Theme**: Madara (WordPress manga/anime theme)
- **Episode list**: rendered as `<li class="wp-manga-chapter">` elements on the anime page
- **Player config**: embedded in each episode page as a JavaScript object `thisChapterSources`

## Mechanism

Each anime page lists all episodes as clickable links. Navigating to an individual episode page loads the video players for that episode. There is no separate API — all data is in the HTML source.

Unlike FRAnime, there is **no intermediate redirect layer**. Provider embed URLs are available directly in the episode page source code.

## Key HTML Elements

| Element | Location | Purpose |
|---------|----------|---------|
| `<li class="wp-manga-chapter">` | Anime page | Episode list with links |
| `var thisChapterSources = {...}` | Episode page | Player iframe configurations |
| `<iframe src="...">` | Inside `thisChapterSources` | Provider embed URLs |

---

**Navigation:** [← Chapter 1](01-search-engine.md) · [Chapter 3 — Language Discovery Analysis →](03-language-discovery.md)
