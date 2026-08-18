/**
 * Integrated Demo: FRAnime to direct stream URL
 * Usage: node demo/index.js "Anime Name" [saison] [episode] [lang] [lecteur]
 *
 * saison, episode : 1-based (default: 1)
 * lang            : vo | vf (default: vo)
 * lecteur         : 1-based (default: vidmoly, else sibnet, else first)
 */

const { API_HEADERS } = require("../poc/headers");
const { searchAnime } = require("../poc/search");
const { decryptWatch2 } = require("../poc/watch2");
const { extractStream } = require("../poc/extract");

async function getAnimeDetails(animeId) {
  const res = await fetch(`https://api.franime.fr/api/anime-by-id/${animeId}`, { headers: API_HEADERS });
  return res.json();
}

function defaultLecteurIndex(lecteurs) {
  const vidmoly = lecteurs.indexOf("vidmoly");
  if (vidmoly >= 0) return vidmoly;
  const sibnet = lecteurs.indexOf("sibnet");
  if (sibnet >= 0) return sibnet;
  return 0;
}

async function getWatch2Url(animeId, saisonIndex, episodeIndex, lang, lecteurIndex) {
  const url = `https://api.franime.fr/api/anime/${animeId}/${saisonIndex}/${episodeIndex}/${lang}/${lecteurIndex}`;
  const res = await fetch(url, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`GET_LECTEUR HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node demo/index.js "Anime Name" [saison] [episode] [lang] [lecteur]');
    process.exit(1);
  }

  const animeName = args[0];
  const targetSaison = parseInt(args[1] ?? "1", 10) - 1;
  const targetEpisode = parseInt(args[2] ?? "1", 10) - 1;
  const lang = args[3] ?? "vo";

  console.log(`[1/5] Searching: "${animeName}"...`);
  const results = await searchAnime(animeName);
  if (!results.length) {
    console.error("No anime found.");
    process.exit(1);
  }

  const anime = results[0];
  console.log(`      → ${anime.title} (id: ${anime.id})`);

  console.log(`[2/5] Fetching details...`);
  const details = await getAnimeDetails(anime.id);
  const saison = details.saisons?.[targetSaison];
  if (!saison) {
    console.error(`Saison ${targetSaison + 1} not found.`);
    process.exit(1);
  }

  const episode = saison.episodes?.[targetEpisode];
  if (!episode) {
    console.error(`Episode ${targetEpisode + 1} not found.`);
    process.exit(1);
  }

  const lecteurs = episode.lang?.[lang]?.lecteurs ?? [];
  if (!lecteurs.length) {
    console.error(`No lecteur for lang=${lang}`);
    process.exit(1);
  }

  const lecteurIndex = args[4]
    ? parseInt(args[4], 10) - 1
    : defaultLecteurIndex(lecteurs);

  if (!lecteurs[lecteurIndex]) {
    console.error(`Lecteur ${lecteurIndex + 1} not found. Available: ${lecteurs.join(", ")}`);
    process.exit(1);
  }

  console.log(`      → ${saison.title} / ${episode.title} / ${lang} / lecteur[${lecteurIndex}]: ${lecteurs[lecteurIndex]}`);

  console.log(`[3/5] Resolving lecteur...`);
  const watch2Url = await getWatch2Url(anime.id, targetSaison, targetEpisode, lang, lecteurIndex);
  console.log(`      → ${watch2Url}`);

  console.log(`[4/5] Decrypting watch2 (XOR)...`);
  const providerUrl = decryptWatch2(watch2Url);
  if (!providerUrl) {
    console.error("Could not decrypt provider URL.");
    process.exit(1);
  }
  console.log(`      → ${providerUrl}`);

  console.log(`[5/5] Extracting stream...`);
  const streamUrl = await extractStream(providerUrl);
  if (!streamUrl) {
    console.error("Could not extract stream URL.");
    process.exit(1);
  }

  console.log(`\n--- SUCCESS ---`);
  console.log(`Anime   : ${anime.title}`);
  console.log(`Saison  : ${targetSaison + 1} — ${saison.title}`);
  console.log(`Episode : ${targetEpisode + 1} — ${episode.title}`);
  console.log(`Lang    : ${lang.toUpperCase()}`);
  console.log(`Provider: ${providerUrl}`);
  console.log(`Stream  : ${streamUrl}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
