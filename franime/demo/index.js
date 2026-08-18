/**
 * Integrated Demo: FRAnime to direct stream URL
 * Usage: node demo/index.js "Anime Name" [saison] [episode] [lang] [lecteur]
 *
 * saison, episode : 1-based (default: 1)
 * lang            : vo | vf (default: vo)
 * lecteur         : 1-based (default: 1)
 */



const API_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Origin": "https://franime.fr",
  "Referer": "https://franime.fr/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

const PROVIDER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://franime.fr/",
};

// --- Step 1: Search ---

async function searchAnime(query) {
  const res = await fetch("https://api.franime.fr/api/animes", { headers: API_HEADERS });
  const animes = await res.json();
  const q = query.toLowerCase();
  return animes.filter((a) => {
    const titles = [a.titleO, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp];
    return titles.some((t) => t?.toLowerCase().includes(q));
  });
}

// --- Step 2: Details ---

async function getAnimeDetails(animeId) {
  const res = await fetch(`https://api.franime.fr/api/anime-by-id/${animeId}`, { headers: API_HEADERS });
  return res.json();
}

// --- Step 3: Stream (GET_LECTEUR) ---

async function getWatch2Url(animeId, saisonIndex, episodeIndex, lang, lecteurIndex) {
  const url = `https://api.franime.fr/api/anime/${animeId}/${saisonIndex}/${episodeIndex}/${lang}/${lecteurIndex}`;
  const res = await fetch(url, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`GET_LECTEUR HTTP ${res.status}`);
  return res.text();
}

// --- Step 4: Watch2 (Playwright iframe bypass) ---

const PROVIDERS = ["sibnet.ru", "filemoon", "sendvid", "vidmoly", "streamtape", "doodstream"];

function decryptWatch2(watch2Url) {
  try {
    const url = new URL(watch2Url);
    for (const [paramName, value] of url.searchParams.entries()) {
      try {
        const base64Decoded = Buffer.from(value, "base64").toString("utf-8");
        if (!/^[0-9a-fA-F]+$/.test(base64Decoded) || base64Decoded.length % 2 !== 0) {
          continue;
        }
        const hexBuffer = Buffer.from(base64Decoded, "hex");

        for (let key = 0; key < 256; key++) {
          const decodedBytes = Buffer.alloc(hexBuffer.length);
          for (let i = 0; i < hexBuffer.length; i++) {
            decodedBytes[i] = hexBuffer[i] ^ key;
          }
          const decodedStr = decodedBytes.toString("utf-8");
          if (decodedStr.startsWith("http://") || decodedStr.startsWith("https://")) {
            if (PROVIDERS.some((p) => decodedStr.includes(p))) {
              return decodedStr;
            }
          }
        }
      } catch (e) {
        // Continue to check other parameters
      }
    }
  } catch (e) {
    // Invalid URL format
  }
  return null;
}

async function resolveWatch2(watch2Url) {
  return decryptWatch2(watch2Url);
}

async function extractFilemoon(url) {
  const { chromium } = require("playwright");

  const browser = await chromium.launch({
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  let streamUrl = null;

  const capture = (u) => { if (!streamUrl && u.includes("master.m3u8")) streamUrl = u; };
  page.on("request", (req) => capture(req.url()));

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    await page.waitForTimeout(4000);
    await page.mouse.click(640, 360);

    const deadline = Date.now() + 25000;
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

// --- Step 5: Extract stream ---

async function extractStream(providerUrl) {
  if (providerUrl.includes("vidmoly")) {
    const res = await fetch(providerUrl, { headers: PROVIDER_HEADERS });
    const html = await res.text();
    const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
    return m ? m[1] : null;
  }

  if (providerUrl.includes("sibnet")) {
    const res = await fetch(providerUrl, { headers: PROVIDER_HEADERS });
    const html = await res.text();
    const m = html.match(/src:\s*["'](\/v\/[a-f0-9]+\/\d+\.mp4)['"]/);
    if (!m) return null;
    const redirect = await fetch(`https://video.sibnet.ru${m[1]}`, {
      headers: { ...PROVIDER_HEADERS, "Referer": providerUrl },
      redirect: "manual",
    });
    const location = redirect.headers.get("location");
    return location ? (location.startsWith("//") ? `https:${location}` : location) : null;
  }

  if (providerUrl.includes("sendvid")) {
    const res = await fetch(providerUrl, { headers: PROVIDER_HEADERS });
    const html = await res.text();
    const m = html.match(/source\s+src="([^"]+\.(?:m3u8|mp4)[^"]*)"|file:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/);
    return m ? (m[1] || m[2]) : null;
  }

  if (providerUrl.includes("filemoon")) {
    return extractFilemoon(providerUrl);
  }

  throw new Error(`Unsupported provider: ${providerUrl}`);
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node demo/index.js "Anime Name" [saison] [episode] [lang] [lecteur]');
    process.exit(1);
  }

  const animeName = args[0];
  const targetSaison = parseInt(args[1] ?? "1") - 1;   // 0-based
  const targetEpisode = parseInt(args[2] ?? "1") - 1;  // 0-based
  const lang = args[3] ?? "vo";
  const lecteurIndex = parseInt(args[4] ?? "1") - 1;   // 0-based

  // 1. Search
  console.log(`[1/5] Searching: "${animeName}"...`);
  const results = await searchAnime(animeName);
  if (!results.length) { console.error("No anime found."); process.exit(1); }
  const anime = results[0];
  console.log(`      → ${anime.titles?.en || anime.titleO} (id: ${anime.id})`);

  // 2. Details
  console.log(`[2/5] Fetching details...`);
  const details = await getAnimeDetails(anime.id);
  const saison = details.saisons?.[targetSaison];
  if (!saison) { console.error(`Saison ${targetSaison + 1} not found.`); process.exit(1); }
  const episode = saison.episodes?.[targetEpisode];
  if (!episode) { console.error(`Episode ${targetEpisode + 1} not found.`); process.exit(1); }
  const lecteurs = episode.lang?.[lang]?.lecteurs ?? [];
  if (!lecteurs.length) { console.error(`No lecteur for lang=${lang}`); process.exit(1); }
  console.log(`      → ${saison.title} / ${episode.title} / ${lang} / lecteur[${lecteurIndex}]: ${lecteurs[lecteurIndex]}`);

  // 3. GET_LECTEUR → watch2 URL
  console.log(`[3/5] Resolving lecteur...`);
  const watch2Url = await getWatch2Url(anime.id, targetSaison, targetEpisode, lang, lecteurIndex);
  console.log(`      → ${watch2Url}`);

  // 4. Bypass CF → provider URL
  console.log(`[4/5] Bypassing Cloudflare (browser)...`);
  const providerUrl = await resolveWatch2(watch2Url);
  if (!providerUrl) { console.error("Could not resolve provider URL."); process.exit(1); }
  console.log(`      → ${providerUrl}`);

  // 5. Extract stream
  console.log(`[5/5] Extracting stream...`);
  const streamUrl = await extractStream(providerUrl);
  if (!streamUrl) { console.error("Could not extract stream URL."); process.exit(1); }

  console.log(`\n--- SUCCESS ---`);
  console.log(`Anime   : ${anime.titles?.en || anime.titleO}`);
  console.log(`Saison  : ${targetSaison + 1} — ${saison.title}`);
  console.log(`Episode : ${targetEpisode + 1} — ${episode.title}`);
  console.log(`Lang    : ${lang.toUpperCase()}`);
  console.log(`Provider: ${providerUrl}`);
  console.log(`Stream  : ${streamUrl}`);
}

main().catch((err) => { console.error("Error:", err.message); process.exit(1); });
