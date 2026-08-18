/**
 * POC: Search VoirAnime
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://voir-anime.to/",
  "Content-Type": "application/x-www-form-urlencoded"
};

async function searchAnime(query) {
  const url = "https://voir-anime.to/wp-admin/admin-ajax.php";
  const params = new URLSearchParams();
  params.append("action", "ajaxsearchpro_search");
  params.append("aspp", query);
  params.append("asid", "2");
  params.append("asp_inst_id", "2_1");
  params.append("options", "qtranslate_lang=0&set_imagecache=&set_customfields=");

  const response = await fetch(url, {
    method: "POST",
    headers: HEADERS,
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  const dataMatch = text.match(/___ASPSTART_DATA___(.*?)___ASPEND_DATA___/s);
  if (!dataMatch) return [];

  const data = JSON.parse(dataMatch[1]);
  return data.results.map((a) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    affiche: a.image,
    synopsis: a.content,
  }));
}

const query = process.argv[2] || "naruto";
searchAnime(query)
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch((err) => console.error("Error:", err));


