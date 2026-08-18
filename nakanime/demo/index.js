/**
 * Integrated Demo: Nakanime search to direct stream URL
 * Usage: node demo/index.js "Anime Name" [season] [episode] [language] [provider_index]
 *
 * season          : season number (default: 1)
 * episode         : episode number (default: 1)
 * language        : VF | VOSTFR | MULTI (optional)
 * provider_index  : 1-based provider index (default: 1)
 */

const { searchAnime } = require("../poc/search");
const { getEpisodeSourcesByNumber } = require("../poc/sources");
const { extractStream } = require("../poc/extract");

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log('Usage: node demo/index.js "Anime Name" [season] [episode] [language] [provider_index]');
    process.exit(1);
  }

  const query = args[0];
  const season = args[1] ? Number(args[1]) : 1;
  const episode = args[2] ? Number(args[2]) : 1;
  const language = args[3] || null;
  const providerIndex = args[4] ? Number(args[4]) - 1 : 0;

  console.log(`[1/4] Searching: "${query}"...`);
  const results = await searchAnime(query);
  if (!results.length) {
    console.error("No anime found.");
    process.exit(1);
  }

  const anime = results[0];
  console.log(`      → ${anime.title} (#${anime.id}, /anime/${anime.id}/${anime.slug})`);

  console.log(`[2/4] Loading episode S${season}E${episode}...`);
  const { episode: ep, sources } = await getEpisodeSourcesByNumber(anime.id, season, episode, language);
  if (!sources.length) {
    console.error("No providers found for this episode.");
    process.exit(1);
  }

  const provider = sources[providerIndex] || sources[0];
  console.log(`      → ${provider.host} [${provider.language}] (${provider.embedUrl})`);

  console.log(`[3/4] Extracting stream...`);
  const streamUrl = await extractStream(provider.embedUrl);
  if (!streamUrl) {
    console.error("Could not extract stream URL.");
    process.exit(1);
  }

  console.log(`\n--- SUCCESS ---`);
  console.log(`Anime   : ${anime.title}`);
  console.log(`Episode : S${season}E${episode} — ${ep.title}`);
  console.log(`Player  : ${provider.host} (${provider.language})`);
  console.log(`Stream  : ${streamUrl}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
