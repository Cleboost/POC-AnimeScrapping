/**
 * POC: Get anime details by ID from FRAnime
 * Returns seasons, episodes, available languages and players
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Origin": "https://franime.fr",
  "Referer": "https://franime.fr/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

async function getAnimeDetails(animeId) {
  const response = await fetch(`https://api.franime.fr/api/anime-by-id/${animeId}`, {
    headers: HEADERS,
  });
  const anime = await response.json();

  return {
    id: anime.id,
    title: anime.titles?.en || anime.titleO,
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

// Direct test
const animeId = process.argv[2] || "517396000974";
getAnimeDetails(animeId).then((res) => console.log(JSON.stringify(res, null, 2)));
