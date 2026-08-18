/**
 * POC: Search Nakanime
 * Input:  search query (string)
 * Output: list of matching animes with id, slug, title, format, languages
 */

const { nakanimeApi } = require("./api");

function pickTitle(title) {
  if (!title) return "Unknown";
  if (typeof title === "string") return title;
  return title.userPreferred || title.english || title.romaji || title.native || "Unknown";
}

function mapAnime(media) {
  return {
    id: media.id,
    slug: media.slug,
    title: pickTitle(media.title),
    format: media.format,
    status: media.status,
    episodes: media.episodes,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    coverImage: media.coverImage?.medium || media.coverImage?.large || null,
    languages: media.languages || media.availableLanguages || [],
  };
}

async function searchAnime(query) {
  const data = await nakanimeApi(`/api/anime?q=${encodeURIComponent(query)}`);
  return (data.media || []).map(mapAnime);
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

module.exports = { searchAnime, mapAnime, pickTitle };
