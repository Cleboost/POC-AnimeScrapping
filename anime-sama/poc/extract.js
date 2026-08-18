/**
 * POC: Extract Seasons & Scans from Anime-Sama
 * Simple implementation parsing script calls in HTML
 */

async function extractAnimeDetails(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const data = {
      anime: [],
      manga: [],
    };

    // Anime extraction (Seasons, Movies...)
    const animeRegex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\)/g;
    let mAnime = animeRegex.exec(html);
    while (mAnime !== null) {
      if (mAnime[1] !== "nom" && mAnime[2] !== "url") {
        data.anime.push({ name: mAnime[1], url: mAnime[2] });
      }
      mAnime = animeRegex.exec(html);
    }

    // Manga extraction (Scans, Modulo...)
    const scanRegex = /panneauScan\("([^"]+)",\s*"([^"]+)"\)/g;
    let mScan = scanRegex.exec(html);
    while (mScan !== null) {
      if (mScan[1] !== "nom" && mScan[2] !== "url") {
        data.manga.push({ name: mScan[1], url: mScan[2] });
      }
      mScan = scanRegex.exec(html);
    }

    return data;
  } catch (error) {
    console.error("Extraction error:", error);
    return null;
  }
}

// Direct test
const url =
  process.argv[2] || "https://anime-sama.to/catalogue/jujutsu-kaisen/";
extractAnimeDetails(url).then((data) => {
  if (data) console.log(JSON.stringify(data, null, 2));
});
