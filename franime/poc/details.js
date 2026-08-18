/**
 * POC: Get anime details by ID from FRAnime
 * Returns seasons, episodes, available languages and players
 */

const { API_HEADERS } = require("./headers");

async function getAnimeDetails(animeId) {
  const response = await fetch(`https://api.franime.fr/api/anime-by-id/${animeId}`, {
    headers: API_HEADERS,
  });
  const anime = await response.json();

  return {
    id: anime.id,
    title: anime.title || anime.titles?.en || anime.titleO,
    titleO: anime.titleO,
    saisons: anime.saisons.map((saison, saisonIndex) => ({
      index: saisonIndex,
      title: saison.title,
      episodes: saison.episodes.map((ep, epIndex) => ({
        index: epIndex,
        title: ep.title,
        langs: {
          vo: ep.lang.vo?.lecteurs ?? [],
          vf: ep.lang.vf?.lecteurs ?? [],
        },
      })),
    })),
  };
}

if (require.main === module) {
  const animeId = process.argv[2] || "517396000974";
  getAnimeDetails(animeId).then((res) => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { getAnimeDetails };
