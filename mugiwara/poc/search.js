/**
 * POC: Search Mugiwara-no Streaming
 * Input:  search query (string)
 * Output: list of matching animes with slug, title, metadata
 */

const { BASE_URL, API_HEADERS } = require("./headers");
const { coverImageUrl } = require("./parse");

function mapSearchResult(item) {
  return {
    title: item.anime,
    slug: item.slug,
    synopsis: item.synopsis,
    type: item.type,
    categories: item.category || [],
    themes: item.themes || [],
    matched: item.matched,
    coverImage: coverImageUrl(item.slug, item.affiche),
    url: `${BASE_URL}/catalogue/${item.slug}`,
  };
}

async function searchAnime(query) {
  const response = await fetch(
    `${BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
    { headers: API_HEADERS },
  );

  if (!response.ok) throw new Error(`Search failed: HTTP ${response.status}`);

  const data = await response.json();
  return (data.results || []).map(mapSearchResult);
}

if (require.main === module) {
  const query = process.argv[2] || "naruto";
  searchAnime(query)
    .then((results) => console.log(JSON.stringify(results, null, 2)))
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { searchAnime, mapSearchResult };
