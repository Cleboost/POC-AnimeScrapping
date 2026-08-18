/**
 * POC: Extract direct stream URL (.m3u8 / .mp4) from a provider embed URL
 * Input:  provider embed URL (vidmoly, sibnet, sendvid, filemoon...)
 * Output: direct stream URL
 *
 * Vidmoly:  regex on HTML → .m3u8
 * Sibnet:   regex on HTML → /v/<token>/<id>.mp4 → follow redirect → CDN mp4
 * Sendvid:  regex on HTML → .mp4 or .m3u8
 * Filemoon: Playwright → intercept master.m3u8 request (PoW-protected API)
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://franime.fr/",
};

// --- Vidmoly ---

async function extractVidmoly(url) {
  const res = await fetch(url, { headers: HEADERS });
  const html = await res.text();
  const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
  return m ? m[1] : null;
}

// --- Sibnet ---
// The embed HTML contains /v/<token>/<videoid>.mp4 which redirects to the CDN mp4.

async function extractSibnet(url) {
  const res = await fetch(url, {
    headers: { ...HEADERS, "Referer": "https://franime.fr/" },
  });
  const html = await res.text();

  const m = html.match(/src:\s*["'](\/v\/[a-f0-9]+\/\d+\.mp4)['"]/);
  if (!m) return null;

  const embedPath = m[1];
  const redirect = await fetch(`https://video.sibnet.ru${embedPath}`, {
    headers: {
      ...HEADERS,
      "Referer": url,
    },
    redirect: "manual",
  });

  // Sibnet redirects to the real CDN URL
  const location = redirect.headers.get("location");
  if (!location) return null;
  return location.startsWith("//") ? `https:${location}` : location;
}

// --- Sendvid ---

async function extractSendvid(url) {
  const res = await fetch(url, { headers: HEADERS });
  const html = await res.text();
  const m = html.match(/source\s+src="([^"]+\.(?:m3u8|mp4)[^"]*)"|file:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/);
  return m ? (m[1] || m[2]) : null;
}

// --- Filemoon ---
// Protected by a PoW + captcha challenge at runtime — Playwright is required.
// Strategy: load filemoon.to/e/<code> and let the SPA navigate naturally to the
// q8y5z.com player. Intercept the master.m3u8 request from any frame or page.

async function extractFilemoon(url) {
  const { chromium } = require("playwright");

  const browser = await chromium.launch({
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  // Use default viewport (1280x720) — custom viewport breaks the play button click detection
  const page = await browser.newPage();
  let streamUrl = null;

  const capture = (u) => { if (!streamUrl && u.includes("master.m3u8")) streamUrl = u; };
  page.on("request", (req) => capture(req.url()));

  try {
    // Let the SPA fetch embed/details and navigate to q8y5z.com on its own
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Wait for the player to initialize, then click the play button (center of default viewport)
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

// --- Router ---

async function extractStream(providerUrl) {
  if (providerUrl.includes("vidmoly")) return extractVidmoly(providerUrl);
  if (providerUrl.includes("sibnet")) return extractSibnet(providerUrl);
  if (providerUrl.includes("sendvid")) return extractSendvid(providerUrl);
  if (providerUrl.includes("filemoon")) return extractFilemoon(providerUrl);
  throw new Error(`Unsupported provider: ${providerUrl}`);
}

// Direct test
const providerUrl = process.argv[2] || "https://video.sibnet.ru/shell.php?videoid=4956170";
extractStream(providerUrl).then((url) => console.log(url));
