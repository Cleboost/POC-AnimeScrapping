/**
 * POC: Search Anime-Sama
 * Simple & direct implementation for research purposes
 */

async function searchAnime(query) {
  const response = await fetch(
    "https://anime-sama.to/template-php/defaut/fetch.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `query=${encodeURIComponent(query)}`,
    },
  );

  const html = await response.text();
  const results = [];
  const regex =
    /<a href="([^"]+)" class="asn-search-result">[\s\S]*?src="([^"]+)"[\s\S]*?title">([^<]+)<\/h3>[\s\S]*?subtitle">([^<]*)<\/p>/g;

  let m;
  while ((m = regex.exec(html)) !== null) {
    results.push({
      url: m[1],
      img: m[2],
      title: m[3]
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .trim(),
      sub: m[4]
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .trim(),
    });
  }
  return results;
}

// Direct test
const query = process.argv[2] || "naruto";
searchAnime(query).then((res) => console.log(JSON.stringify(res, null, 2)));
