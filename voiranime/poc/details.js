/**
 * POC: Get anime details and episode players from VoirAnime
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://voir-anime.to/"
};

async function getAnimeDetails(animeUrl) {
  const response = await fetch(animeUrl, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP error fetching details! status: ${response.status}`);
  }
  const html = await response.text();

  const titleMatch = html.match(/<div class="post-title">\s*<h1>\s*(.*?)\s*<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : "Unknown Anime";

  const episodeRegex = /<li class="wp-manga-chapter\s*[^"]*">\s*<a href="([^"]+)">\s*([\s\S]*?)\s*<\/a>/g;
  let match;
  const episodes = [];
  while ((match = episodeRegex.exec(html)) !== null) {
    episodes.push({
      url: match[1],
      title: match[2].trim().replace(/\s+/g, " ")
    });
  }

  episodes.reverse();

  return {
    title,
    url: animeUrl,
    episodes: episodes.map((ep, index) => ({
      index: index + 1,
      title: ep.title,
      url: ep.url
    }))
  };
}

async function getEpisodePlayers(episodeUrl) {
  const response = await fetch(episodeUrl, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP error fetching episode! status: ${response.status}`);
  }
  const html = await response.text();

  const sourcesMatch = html.match(/var\s+thisChapterSources\s*=\s*({[^}]+});/);
  if (!sourcesMatch) return [];

  try {
    const sources = JSON.parse(sourcesMatch[1]);
    const players = [];

    for (const [name, iframeHtml] of Object.entries(sources)) {
      const srcMatch = iframeHtml.match(/src="([^"]+)"/);
      if (srcMatch) {
        players.push({
          name: name,
          embedUrl: srcMatch[1].replace(/\\/g, "")
        });
      }
    }
    return players;
  } catch (err) {
    console.error("Failed to parse episode players JSON:", err.message);
    return [];
  }
}

const animeUrl = process.argv[2] || "https://voir-anime.to/anime/solo-leveling-2-vf/";
getAnimeDetails(animeUrl)
  .then(async (details) => {
    console.log(`\nAnime: ${details.title}`);
    console.log(`Found ${details.episodes.length} episodes.`);
    
    if (details.episodes.length > 0) {
      const targetEp = details.episodes[details.episodes.length - 1];
      console.log(`\nFetching players for "${targetEp.title}" (${targetEp.url})...`);
      const players = await getEpisodePlayers(targetEp.url);
      console.log("Players found:", JSON.stringify(players, null, 2));
    }
  })
  .catch((err) => console.error("Error:", err));


