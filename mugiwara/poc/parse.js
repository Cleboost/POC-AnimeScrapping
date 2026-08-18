const { BASE_URL, API_HEADERS } = require("./headers");

const IMAGES_BASE =
  "https://raw.githubusercontent.com/NOUSSS/mugiwara-no-streaming-images/main/Animes";

function unescapeRscJson(slice) {
  return slice.replace(/\\"/g, '"').replace(/\\n/g, "\n");
}

function extractJsonObject(html, startIdx) {
  let objStart = startIdx;
  while (objStart > 0 && html[objStart] !== "{") objStart--;

  const slice = html.slice(objStart);
  let depth = 0;

  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "{" && (i === 0 || slice[i - 1] !== "\\")) depth++;
    else if (slice[i] === "}" && slice[i - 1] !== "\\") {
      depth--;
      if (depth === 0) return slice.slice(0, i + 1);
    }
  }

  throw new Error("Could not extract JSON object from page");
}

function parseAnimeServer(html, slug) {
  const marker = `\\"slug\\":\\"${slug}\\"`;
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error(`Anime slug not found in page: ${slug}`);

  const raw = extractJsonObject(html, idx);
  return JSON.parse(unescapeRscJson(raw));
}

function parseEpisodeNames(html) {
  const episodes = [];
  const re = /\\"name\\":\\"([^\\]+)\\",\\"index\\":(\d+)/g;
  let match;

  while ((match = re.exec(html)) !== null) {
    episodes.push({ number: Number(match[2]), title: match[1] });
  }

  return episodes;
}

function seasonUrlPath(seasonId) {
  if (seasonId === "kai") return "kai";
  return `saison${seasonId}`;
}

function resolveEmbedUrl(embedUrl) {
  const match = embedUrl.match(/\/embed-[a-zA-Z0-9]+\.html/);
  if (!match) return embedUrl;

  const embedPath = match[0];

  if (/vidmoly\./i.test(embedUrl)) {
    return `https://ansembed.net${embedPath}`;
  }

  return embedUrl;
}

function detectHost(url) {
  const lower = url.toLowerCase();
  if (lower.includes("vidmoly")) return "vidmoly";
  if (lower.includes("sibnet")) return "sibnet";
  if (lower.includes("sendvid")) return "sendvid";
  if (lower.includes("filemoon")) return "filemoon";
  if (lower.includes("oneupload")) return "oneupload";
  if (lower.includes("voe.")) return "voe";
  if (lower.includes("mail.ru") || lower.includes("ok.ru")) return "okru";
  return "unknown";
}

function normalizeLang(lang) {
  return String(lang || "").trim().toLowerCase();
}

function coverImageUrl(slug, affiche) {
  const file = affiche || "Affiche.jpg";
  return `${IMAGES_BASE}/${slug}/${file}`;
}

function findSeason(animeServer, seasonId) {
  const options = animeServer.options || {};
  const wanted = String(seasonId);

  if (wanted === "kai") {
    const kai = options.kai || [];
    return kai.find((entry) => entry.id === "kai") || kai[0] || null;
  }

  return (options.saisons || []).find((entry) => entry.id === wanted) || null;
}

function listSeasonEntries(animeServer) {
  const options = animeServer.options || {};
  const seasons = (options.saisons || []).map((season) => ({
    id: season.id,
    name: season.name,
    path: seasonUrlPath(season.id),
    languages: Object.keys(season.lang || {}),
    providersPerLang: Object.fromEntries(
      Object.entries(season.lang || {}).map(([lang, providers]) => [lang, providers.length]),
    ),
    episodesPerProvider: Object.fromEntries(
      Object.entries(season.lang || {}).map(([lang, providers]) => [
        lang,
        providers[0]?.length || 0,
      ]),
    ),
    url: `${BASE_URL}/catalogue/${animeServer.slug}/episodes/${seasonUrlPath(season.id)}`,
  }));

  const kai = (options.kai || []).map((entry) => ({
    id: entry.id,
    name: entry.name,
    path: "kai",
    languages: Object.keys(entry.lang || {}),
    providersPerLang: Object.fromEntries(
      Object.entries(entry.lang || {}).map(([lang, providers]) => [lang, providers.length]),
    ),
    episodesPerProvider: Object.fromEntries(
      Object.entries(entry.lang || {}).map(([lang, providers]) => [
        lang,
        providers[0]?.length || 0,
      ]),
    ),
    url: `${BASE_URL}/catalogue/${animeServer.slug}/episodes/kai`,
  }));

  return [...seasons, ...kai];
}

function collectLanguages(animeServer) {
  const langs = new Set();

  for (const entry of listSeasonEntries(animeServer)) {
    for (const lang of entry.languages) langs.add(normalizeLang(lang).toUpperCase());
  }

  return [...langs].sort();
}

async function fetchPage(path) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: API_HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response.text();
}

async function fetchAnimeServer(slug) {
  const html = await fetchPage(`/catalogue/${slug}`);
  return parseAnimeServer(html, slug);
}

async function fetchEpisodeNames(slug, seasonId) {
  const html = await fetchPage(
    `/catalogue/${slug}/episodes/${seasonUrlPath(seasonId)}`,
  );
  return parseEpisodeNames(html);
}

module.exports = {
  BASE_URL,
  IMAGES_BASE,
  parseAnimeServer,
  parseEpisodeNames,
  seasonUrlPath,
  detectHost,
  normalizeLang,
  coverImageUrl,
  findSeason,
  listSeasonEntries,
  collectLanguages,
  fetchPage,
  fetchAnimeServer,
  fetchEpisodeNames,
  resolveEmbedUrl,
};
