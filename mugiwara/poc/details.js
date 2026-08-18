/**
 * POC: Get anime details, seasons and episode names from Mugiwara
 * Input:  slug (+ optional season id for episode names)
 * Output: anime metadata + seasons + optional episode list
 */

const { BASE_URL } = require("./headers");
const {
  coverImageUrl,
  collectLanguages,
  fetchAnimeServer,
  fetchEpisodeNames,
  listSeasonEntries,
} = require("./parse");

async function getAnimeDetails(slug, seasonId = null) {
  const animeServer = await fetchAnimeServer(slug);
  const seasons = listSeasonEntries(animeServer);

  let episodes = [];
  if (seasonId) {
    episodes = await fetchEpisodeNames(slug, seasonId);
  }

  return {
    slug: animeServer.slug,
    title: animeServer.anime,
    synopsis: animeServer.synopsis,
    type: animeServer.type,
    categories: animeServer.category || [],
    themes: animeServer.themes || [],
    adult: animeServer.adult,
    airing: animeServer.airing,
    coverImage: coverImageUrl(animeServer.slug, animeServer.options?.affiche),
    url: `${BASE_URL}/catalogue/${animeServer.slug}`,
    languages: collectLanguages(animeServer),
    seasons,
    episodes,
  };
}

async function getEpisodeByNumber(slug, seasonId, episodeNumber) {
  const details = await getAnimeDetails(slug, seasonId);
  const episode = details.episodes.find((ep) => ep.number === episodeNumber);

  if (!episode) {
    throw new Error(
      `Episode ${episodeNumber} not found for ${slug} season ${seasonId}`,
    );
  }

  return { anime: details, episode };
}

if (require.main === module) {
  const slug = process.argv[2] || "naruto";
  const seasonId = process.argv[3] || "1";
  const episodeNumber = process.argv[4] ? Number(process.argv[4]) : null;

  getAnimeDetails(slug, seasonId)
    .then((details) => {
      console.log(`\nAnime: ${details.title} (${details.slug})`);
      console.log(`URL: ${details.url}`);
      console.log(`Languages: ${details.languages.join(", ") || "n/a"}`);
      console.log(`Seasons (${details.seasons.length}):`);
      for (const season of details.seasons) {
        const counts = Object.entries(season.episodesPerProvider || {})
          .map(([lang, count]) => `${lang}:${count}`)
          .join(", ");
        console.log(`  - [${season.id}] ${season.name} (${counts}) → ${season.url}`);
      }

      if (episodeNumber) {
        const episode = details.episodes.find((ep) => ep.number === episodeNumber);
        if (episode) {
          console.log(`\nEpisode ${episodeNumber}: ${episode.title}`);
        }
      } else if (details.episodes.length) {
        console.log(`\nEpisode names loaded: ${details.episodes.length}`);
        console.log(
          `First: E${details.episodes[0].number} — ${details.episodes[0].title}`,
        );
      }
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { getAnimeDetails, getEpisodeByNumber };
