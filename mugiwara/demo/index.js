/**
 * Integrated Demo: Mugiwara search to direct stream URL
 * Usage: node demo/index.js "Anime Name" [season_id] [episode] [language] [provider_index]
 *
 * season_id       : season id from catalogue (default: 1) — e.g. 1, 1hs, kai
 * episode         : episode number (default: 1)
 * language        : vf | vostfr (optional)
 * provider_index  : 1-based provider index (default: 1)
 */

const { BASE_URL } = require("../poc/headers");
const { seasonUrlPath } = require("../poc/parse");
const { searchAnime } = require("../poc/search");
const { getEpisodeSourcesByNumber } = require("../poc/sources");
const { extractStreamFromSources } = require("../poc/extract");

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log(
      'Usage: node demo/index.js "Anime Name" [season_id] [episode] [language] [provider_index]',
    );
    process.exit(1);
  }

  const query = args[0];
  const seasonId = args[1] || "1";
  const episodeNumber = args[2] ? Number(args[2]) : 1;
  const language = args[3] || null;
  const providerIndex = args[4] ? Number(args[4]) - 1 : 0;

  console.log(`[1/4] Searching: "${query}"...`);
  const results = await searchAnime(query);
  if (!results.length) {
    console.error("No anime found.");
    process.exit(1);
  }

  const anime = results[0];
  console.log(`      → ${anime.title} (${anime.slug})`);

  console.log(`[2/4] Loading episode S${seasonId}E${episodeNumber}...`);
  const { season, episode, sources } = await getEpisodeSourcesByNumber(
    anime.slug,
    seasonId,
    episodeNumber,
    language,
  );

  if (!sources.length) {
    console.error("No providers found for this episode.");
    process.exit(1);
  }

  const parentPageUrl = `${BASE_URL}/catalogue/${anime.slug}/episodes/${seasonUrlPath(seasonId)}`;
  console.log(`      → [${season.id}] ${season.name} — ${episode.title}`);
  console.log(`      → Watch page: ${parentPageUrl}`);
  console.log(`      → Providers: ${sources.map((s) => s.host).join(", ")}`);

  console.log(`[3/4] Extracting stream (trying providers until one works)...`);
  const result = await extractStreamFromSources(sources, {
    parentPageUrl,
    providerIndex,
  });

  if (!result) {
    console.error("Could not extract stream URL from any provider.");
    console.error("Tip: install Playwright — cd mugiwara && npm install");
    process.exit(1);
  }

  const { stream, source } = result;
  if (source.resolvedEmbedUrl && source.resolvedEmbedUrl !== source.embedUrl) {
    console.log(`      → resolved: ${source.resolvedEmbedUrl}`);
  }
  console.log(`      → ${source.host} [${source.language}] (${source.embedUrl})`);

  console.log(`\n--- SUCCESS ---`);
  console.log(`Anime   : ${anime.title}`);
  console.log(`Episode : [${season.id}] E${episode.number} — ${episode.title}`);
  console.log(`Player  : ${source.host} (${source.language})`);
  console.log(`Stream  : ${stream}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
