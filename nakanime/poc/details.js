/**
 * POC: Get anime details, seasons, episodes and languages from Nakanime
 * Input:  anime id (number) or slug (string)
 * Output: anime metadata + episodesList + seasons
 */

const { nakanimeApi } = require("./api");
const { pickTitle } = require("./search");

function normalizeLang(lang) {
  return String(lang || "").trim().toUpperCase();
}

function collectLanguages(anime) {
  const langs = new Set();

  for (const episode of anime.episodesList || []) {
    for (const source of episode.sources || []) {
      if (source.language) langs.add(normalizeLang(source.language));
    }
  }

  if (langs.size === 0) {
    for (const value of Object.values(anime.languages || {})) {
      if (value) langs.add(normalizeLang(value));
    }
  }

  return [...langs].sort();
}

async function getAnimeDetails(animeRef) {
  const path = `/api/anime/${animeRef}`;
  const anime = await nakanimeApi(path);

  const episodes = (anime.episodesList || []).map((episode) => ({
    id: episode.id,
    number: episode.number,
    title: episode.titleFr || episode.title,
    isFiller: episode.isFiller,
    seasonId: episode.seasonId,
    seasonNumber: (anime.seasons || []).find((s) => s.id === episode.seasonId)?.number || 1,
    url: `https://nakanime.tv/anime/${anime.id}/season/${(anime.seasons || []).find((s) => s.id === episode.seasonId)?.number || 1}/episode/${episode.number}`,
  }));

  return {
    id: anime.id,
    slug: anime.slug,
    title: pickTitle(anime.title),
    description: anime.description,
    format: anime.format,
    status: anime.status,
    episodesCount: anime.episodes,
    averageScore: anime.averageScore,
    coverImage: anime.coverImage?.extraLarge || anime.coverImage?.large || null,
    seasons: anime.seasons || [],
    languages: collectLanguages(anime),
    episodes,
  };
}

async function getEpisodeByNumber(animeRef, seasonNumber, episodeNumber) {
  const details = await getAnimeDetails(animeRef);
  const episode = details.episodes.find(
    (ep) => ep.seasonNumber === seasonNumber && ep.number === episodeNumber,
  );

  if (!episode) {
    throw new Error(`Episode S${seasonNumber}E${episodeNumber} not found for anime ${animeRef}`);
  }

  return { anime: details, episode };
}

if (require.main === module) {
  const animeRef = process.argv[2] || "997";
  const season = process.argv[3] ? Number(process.argv[3]) : 1;
  const episode = process.argv[4] ? Number(process.argv[4]) : 1;

  getEpisodeByNumber(animeRef, season, episode)
    .then(({ anime, episode: ep }) => {
      console.log(`\nAnime: ${anime.title} (#${anime.id})`);
      console.log(`Languages: ${anime.languages.join(", ") || "n/a"}`);
      console.log(`Episodes: ${anime.episodes.length}`);
      console.log(`\nSelected: S${ep.seasonNumber}E${ep.number} — ${ep.title}`);
      console.log(`Episode ID: ${ep.id}`);
      console.log(`URL: ${ep.url}`);
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { getAnimeDetails, getEpisodeByNumber, collectLanguages };
