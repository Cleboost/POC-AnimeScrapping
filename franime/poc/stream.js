/**
 * POC: Get stream URL for an episode from FRAnime
 * API: GET /anime/:animeId/:saisonIndex/:episodeIndex/:lang/:lecteurIndex
 * All indices are 0-based. Returns a plain-text redirect URL.
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Origin": "https://franime.fr",
  "Referer": "https://franime.fr/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

async function getStreamUrl(animeId, saisonIndex, episodeIndex, lang, lecteurIndex) {
  const url = `https://api.franime.fr/api/anime/${animeId}/${saisonIndex}/${episodeIndex}/${lang}/${lecteurIndex}`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

// Direct test: Re:Zero S1E1 VF lecteur 0 (sibnet)
const [animeId, saisonIndex, episodeIndex, lang, lecteurIndex] = [
  process.argv[2] || "517396000974",
  parseInt(process.argv[3] ?? "0"),
  parseInt(process.argv[4] ?? "0"),
  process.argv[5] || "vf",
  parseInt(process.argv[6] ?? "0"),
];

getStreamUrl(animeId, saisonIndex, episodeIndex, lang, lecteurIndex)
  .then((url) => console.log(url));
