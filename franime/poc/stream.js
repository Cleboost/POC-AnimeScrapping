/**
 * POC: Get stream URL for an episode from FRAnime
 * API: GET /anime/:animeId/:saisonIndex/:episodeIndex/:lang/:lecteurIndex
 * All indices are 0-based. Returns a plain-text redirect URL.
 */

const { API_HEADERS } = require("./headers");

async function getStreamUrl(animeId, saisonIndex, episodeIndex, lang, lecteurIndex) {
  const url = `https://api.franime.fr/api/anime/${animeId}/${saisonIndex}/${episodeIndex}/${lang}/${lecteurIndex}`;
  const response = await fetch(url, { headers: API_HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

if (require.main === module) {
  const [animeId, saisonIndex, episodeIndex, lang, lecteurIndex] = [
    process.argv[2] || "517396000974",
    parseInt(process.argv[3] ?? "0"),
    parseInt(process.argv[4] ?? "0"),
    process.argv[5] || "vf",
    parseInt(process.argv[6] ?? "0"),
  ];

  getStreamUrl(animeId, saisonIndex, episodeIndex, lang, lecteurIndex)
    .then((url) => console.log(url));
}

module.exports = { getStreamUrl };
