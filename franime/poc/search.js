/**
 * POC: Search FRAnime
 * Input:  search query (string)
 * Output: list of matching animes with id, titles, format, status
 *
 * The site loads the full catalogue once then filters client-side.
 * We replicate that behavior: one fetch, local filter on all title variants.
 */

const { API_HEADERS } = require("./headers");

function normalizeQuery(query) {
  return query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function collectTitles(anime) {
  return [anime.title, anime.titleO, ...Object.values(anime.titles || {})]
    .filter(Boolean)
    .map(String);
}

function matchesAnime(anime, query) {
  const q = normalizeQuery(query);
  if (!q) return false;

  const qCompact = q.replace(/\s/g, "");

  return collectTitles(anime).some((title) => {
    const t = normalizeQuery(title);
    const tCompact = t.replace(/\s/g, "");
    return t.includes(q) || tCompact.includes(qCompact);
  });
}

async function searchAnime(query) {
  const response = await fetch("https://api.franime.fr/api/animes", { headers: API_HEADERS });
  const animes = await response.json();

  return animes
    .filter((anime) => matchesAnime(anime, query))
    .map((anime) => ({
      id: anime.id,
      title: anime.title || anime.titles?.en || anime.titleO,
      titleO: anime.titleO,
      affiche: anime.affiche_small || anime.affiche,
      format: anime.format,
      status: anime.status,
      note: anime.note,
    }));
}

if (require.main === module) {
  const query = process.argv[2] || "naruto";
  searchAnime(query).then((res) => console.log(JSON.stringify(res, null, 2)));
}

module.exports = { searchAnime };
