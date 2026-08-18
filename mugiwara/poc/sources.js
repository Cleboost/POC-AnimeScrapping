/**
 * POC: Resolve episode providers (embed URLs) from Mugiwara catalogue data
 * Input:  slug + season id + episode number (+ optional language)
 * Output: list of providers with host, language and embed URL
 */

const {
  detectHost,
  findSeason,
  fetchAnimeServer,
  fetchEpisodeNames,
  normalizeLang,
} = require("./parse");
const { getEpisodeByNumber } = require("./details");

const { resolveEmbedUrl } = require("./parse");

function mapProvider(embedUrl, providerIndex, language) {
  const resolvedEmbedUrl = resolveEmbedUrl(embedUrl);
  return {
    index: providerIndex,
    host: detectHost(embedUrl),
    language: normalizeLang(language).toUpperCase(),
    embedUrl: embedUrl.trim(),
    resolvedEmbedUrl,
  };
}

function pickLanguageUrls(season, language) {
  const langMap = season.lang || {};
  const wanted = normalizeLang(language);

  if (wanted && langMap[wanted]) return { language: wanted, urlsByProvider: langMap[wanted] };

  if (langMap.vostfr) return { language: "vostfr", urlsByProvider: langMap.vostfr };
  if (langMap.vf) return { language: "vf", urlsByProvider: langMap.vf };

  const [firstLang] = Object.keys(langMap);
  if (!firstLang) return { language: null, urlsByProvider: [] };

  return { language: firstLang, urlsByProvider: langMap[firstLang] };
}

async function getEpisodeSources({ slug, seasonId, episodeNumber, language = null }) {
  const animeServer = await fetchAnimeServer(slug);
  const season = findSeason(animeServer, seasonId);

  if (!season) throw new Error(`Season not found: ${seasonId}`);

  const { language: resolvedLang, urlsByProvider } = pickLanguageUrls(season, language);
  if (!urlsByProvider.length) throw new Error("No providers found for this season");

  const sources = urlsByProvider
    .map((urls, providerIndex) => {
      const embedUrl = urls[episodeNumber - 1];
      if (!embedUrl) return null;
      return mapProvider(embedUrl, providerIndex, resolvedLang);
    })
    .filter(Boolean);

  if (!sources.length) {
    throw new Error(`No provider URL for episode ${episodeNumber}`);
  }

  return {
    anime: {
      slug: animeServer.slug,
      title: animeServer.anime,
    },
    season: {
      id: season.id,
      name: season.name,
    },
    language: resolvedLang?.toUpperCase(),
    sources,
  };
}

async function getEpisodeSourcesByNumber(slug, seasonId, episodeNumber, language = null) {
  const payload = await getEpisodeSources({
    slug,
    seasonId,
    episodeNumber,
    language,
  });

  let episodeTitle = `Episode ${episodeNumber}`;
  try {
    const names = await fetchEpisodeNames(slug, seasonId);
    const match = names.find((ep) => ep.number === episodeNumber);
    if (match) episodeTitle = match.title;
  } catch {
    // Episode names are optional — catalogue URLs are enough for the POC
  }

  return {
    ...payload,
    episode: {
      number: episodeNumber,
      title: episodeTitle,
    },
  };
}

if (require.main === module) {
  const slug = process.argv[2] || "naruto";
  const seasonId = process.argv[3] || "1";
  const episodeNumber = Number(process.argv[4] || 1);
  const language = process.argv[5] || null;

  getEpisodeSourcesByNumber(slug, seasonId, episodeNumber, language)
    .then(({ anime, season, episode, language: lang, sources }) => {
      console.log(`\nAnime: ${anime.title}`);
      console.log(`Season: [${season.id}] ${season.name}`);
      console.log(`Episode: E${episode.number} — ${episode.title}`);
      console.log(`Language: ${lang}`);
      console.log(`Providers (${sources.length}):`);
      console.log(JSON.stringify(sources, null, 2));
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { getEpisodeSources, getEpisodeSourcesByNumber, mapProvider };
