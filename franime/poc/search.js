/**
 * POC: Search FRAnime
 * Input:  search query (string)
 * Output: list of matching animes with id, titles, format, status
 *
 * The site loads the full catalogue once then filters client-side.
 * We replicate that behavior: one fetch, local filter on all title variants.
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Origin": "https://franime.fr",
  "Referer": "https://franime.fr/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

async function searchAnime(query) {
  const response = await fetch("https://api.franime.fr/api/animes", { headers: HEADERS });
  const animes = await response.json();

  const q = query.toLowerCase();
  return animes
    .filter((a) => {
      const titles = [a.titleO, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp];
      return titles.some((t) => t?.toLowerCase().includes(q));
    })
    .map((a) => ({
      id: a.id,
      title: a.titles?.en || a.titleO,
      titleO: a.titleO,
      affiche: a.affiche_small || a.affiche,
      format: a.format,
      status: a.status,
      note: a.note,
    }));
}

// Direct test
const query = process.argv[2] || "naruto";
searchAnime(query).then((res) => console.log(JSON.stringify(res, null, 2)));
