/**
 * POC: Resolve episode providers (embed URLs) from Nakanime API
 * Input:  anime_id + episode_id (+ optional language filter)
 * Output: list of providers with host, language and embed URL
 */

const { nakanimeApi } = require("./api");
const { getEpisodeByNumber } = require("./details");

function normalizeLang(lang) {
  return String(lang || "").trim().toUpperCase();
}

function mapSource(source) {
  return {
    id: source.id,
    host: source.host,
    language: normalizeLang(source.language),
    embedUrl: source.url,
    episodeId: source.episodeId,
  };
}

async function getEpisodeSources({ animeId, episodeId, language = null }) {
  const sources = await nakanimeApi("/api/sources/anime", {
    method: "POST",
    body: {
      anime_id: Number(animeId),
      episode_id: Number(episodeId),
    },
  });

  const mapped = (sources || []).map(mapSource);

  if (!language) return mapped;

  const wanted = normalizeLang(language);
  const filtered = mapped.filter((source) => source.language === wanted);
  return filtered.length ? filtered : mapped;
}

async function getEpisodeSourcesByNumber(animeRef, seasonNumber, episodeNumber, language = null) {
  const { anime, episode } = await getEpisodeByNumber(animeRef, seasonNumber, episodeNumber);
  const sources = await getEpisodeSources({
    animeId: anime.id,
    episodeId: episode.id,
    language,
  });

  return { anime, episode, sources };
}

if (require.main === module) {
  const animeRef = process.argv[2] || "997";
  const season = Number(process.argv[3] || 1);
  const episode = Number(process.argv[4] || 1);
  const language = process.argv[5] || null;

  getEpisodeSourcesByNumber(animeRef, season, episode, language)
    .then(({ anime, episode: ep, sources }) => {
      console.log(`\nAnime: ${anime.title}`);
      console.log(`Episode: S${ep.seasonNumber}E${ep.number} — ${ep.title}`);
      console.log(`Providers (${sources.length}):`);
      console.log(JSON.stringify(sources, null, 2));
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { getEpisodeSources, getEpisodeSourcesByNumber, mapSource };
