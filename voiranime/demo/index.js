/**
 * Integrated Demo: VoirAnime search to direct stream URL
 * Usage: node demo/index.js "Anime Name" [episode] [lecteur_index]
 *
 * episode       : 1-based episode number (default: latest)
 * lecteur_index : 1-based player index (default: 1)
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://voir-anime.to/"
};

// --- Step 1: Search ---
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
    headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) throw new Error(`Search HTTP ${response.status}`);
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

// --- Step 2: Details ---
async function getAnimeDetails(animeUrl) {
  const response = await fetch(animeUrl, { headers: HEADERS });
  if (!response.ok) throw new Error(`Details HTTP ${response.status}`);
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
    episodes: episodes.map((ep, index) => ({
      index: index + 1,
      title: ep.title,
      url: ep.url
    }))
  };
}

// --- Step 3: Episode Players ---
async function getEpisodePlayers(episodeUrl) {
  const response = await fetch(episodeUrl, { headers: HEADERS });
  if (!response.ok) throw new Error(`Episode HTTP ${response.status}`);
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
          name,
          embedUrl: srcMatch[1].replace(/\\/g, "")
        });
      }
    }
    return players;
  } catch (err) {
    return [];
  }
}

// --- Step 4: Extract Stream ---
async function extractVidmoly(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Vidmoly HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
  return m ? m[1] : null;
}

async function extractGenericPlaywright(url, parentPageUrl) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  context.on("page", async (popup) => {
    if (popup !== page) {
      try {
        await popup.close();
      } catch (e) {}
    }
  });

  let streamUrl = null;
  page.on("request", (req) => {
    const u = req.url();
    if (!streamUrl && (u.includes(".m3u8") || u.includes(".mp4"))) {
      if (!u.includes("analytics") && !u.includes("doubleclick") && !u.includes("google")) {
        streamUrl = u;
      }
    }
  });

  try {
    await page.goto(parentPageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.evaluate((iframeUrl) => {
      const container = document.getElementById("chapter-video-frame") || document.body;
      container.innerHTML = `<iframe id="scrapper-frame" src="${iframeUrl}" width="100%" height="450px" allowfullscreen></iframe>`;
    }, url);

    await page.waitForTimeout(5000);
    await page.bringToFront();

    const iframeBoundingBox = await page.locator("iframe#scrapper-frame").boundingBox();
    if (iframeBoundingBox) {
      const x = iframeBoundingBox.x + iframeBoundingBox.width / 2;
      const y = iframeBoundingBox.y + iframeBoundingBox.height / 2;
      await page.mouse.click(x, y);
      await page.waitForTimeout(2500);
      if (!streamUrl) {
        await page.mouse.click(x, y);
      }
    }

    const deadline = Date.now() + 15000;
    while (!streamUrl && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
    
    await browser.close();
    return streamUrl;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function extractStream(providerUrl, parentPageUrl) {
  if (providerUrl.includes("vidmoly")) {
    try {
      const fastUrl = await extractVidmoly(providerUrl);
      if (fastUrl) return fastUrl;
    } catch (e) {}
  }
  return extractGenericPlaywright(providerUrl, parentPageUrl);
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node demo/index.js "Anime Name" [episode_number] [lecteur_index]');
    process.exit(1);
  }

  const animeName = args[0];
  const targetEp = args[1] ? parseInt(args[1]) : null;
  const lecteurIndex = args[2] ? parseInt(args[2]) - 1 : 0;

  // 1. Search
  console.log(`[1/4] Searching: "${animeName}"...`);
  const results = await searchAnime(animeName);
  if (!results.length) { console.error("No anime found."); process.exit(1); }
  const anime = results[0];
  console.log(`      → ${anime.title} (${anime.link})`);

  // 2. Details (Episodes list)
  console.log(`[2/4] Fetching episodes list...`);
  const details = await getAnimeDetails(anime.link);
  if (!details.episodes.length) { console.error("No episodes found."); process.exit(1); }
  
  const episode = targetEp 
    ? details.episodes.find(e => e.index === targetEp)
    : details.episodes[details.episodes.length - 1]; // default to latest
  
  if (!episode) { console.error(`Episode ${targetEp} not found.`); process.exit(1); }
  console.log(`      → Selected: ${episode.title} (${episode.url})`);

  // 3. Resolve Players
  console.log(`[3/4] Resolving players list...`);
  const players = await getEpisodePlayers(episode.url);
  if (!players.length) { console.error("No players found for this episode."); process.exit(1); }
  
  const player = players[lecteurIndex] || players[0];
  console.log(`      → Selected: ${player.name} (${player.embedUrl})`);

  // 4. Extract direct stream
  console.log(`[4/4] Extracting stream (browser automation)...`);
  const streamUrl = await extractStream(player.embedUrl, episode.url);
  if (!streamUrl) { console.error("Could not extract stream URL."); process.exit(1); }

  console.log(`\n--- SUCCESS ---`);
  console.log(`Anime   : ${details.title}`);
  console.log(`Episode : ${episode.title}`);
  console.log(`Player  : ${player.name}`);
  console.log(`Stream  : ${streamUrl}`);
}

main().catch((err) => { console.error("Error:", err.message); process.exit(1); });
