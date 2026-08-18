# Chapter 1: Search Engine Analysis

VoirAnime uses the **Ajax Search Pro** WordPress plugin for instant search. Instead of scraping the HTML search page, we query its AJAX API directly.

## Endpoint

- **URL**: `https://voir-anime.to/wp-admin/admin-ajax.php`
- **Method**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Headers**:
  - `Referer: https://voir-anime.to/`
  - `User-Agent: <Browser User Agent>`

## Request Body Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `action` | `ajaxsearchpro_search` | WordPress AJAX action |
| `aspp` | `<search query>` | Text to search for |
| `asid` | `2` | Search instance configuration ID |
| `asp_inst_id` | `2_1` | Instance identifier |
| `options` | `qtranslate_lang=0&set_imagecache=&set_customfields=` | Plugin options |

## Mechanism

The API returns a combined string with custom delimiters:

```text
___ASPSTART_HTML___<Dropdown HTML>___ASPEND_HTML______ASPSTART_DATA___<JSON DATA>___ASPEND_DATA___
```

The script parses the content between `___ASPSTART_DATA___` and `___ASPEND_DATA___` as JSON.

### Example output for query `"ore dake"`

```json
[
  {
    "id": 104686,
    "title": "Solo Leveling 2 (VF)",
    "link": "https://voir-anime.to/anime/solo-leveling-2-vf/",
    "affiche": "https://voir-anime.to/wp-content/uploads/2024/12/thumb_6762e7936c248.png",
    "synopsis": "Saison 2 de \"Solo Leveling\""
  }
]
```

## POC Implementation

The script `poc/search.js` sends the POST request, extracts the JSON payload, and returns a clean result array.

### Usage

```sh
node poc/search.js "ore dake"
```

---

**Navigation:** [← Introduction](00-intro.md) · [Chapter 2 — Catalog Structure Analysis →](02-catalog-structure.md)
