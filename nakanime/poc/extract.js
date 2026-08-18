/**
 * POC: Extract direct stream URL (.m3u8 / .mp4) from a provider embed URL
 */

const { PROVIDER_HEADERS } = require("./headers");

async function extractVidmoly(url) {
  const res = await fetch(url, { headers: PROVIDER_HEADERS });
  const html = await res.text();
  const match = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
  return match ? match[1] : null;
}

function parseSibnetVideoPath(html) {
  const patterns = [
    /player\.src\(\[\{src:\s*['"]([^'"]+)['"]/,
    /['"]file['"]\s*:\s*['"](\/v\/[^'"]+)['"]/,
    /src:\s*['"](\/v\/[^'"]+)['"]/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function extractSibnet(url) {
  const headers = {
    ...PROVIDER_HEADERS,
    Referer: url,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  const res = await fetch(url, { headers });
  if (!res.ok) return null;

  const html = await res.text();
  const path = parseSibnetVideoPath(html);
  if (!path) return null;

  const videoUrl = path.startsWith("http") ? path : `https://video.sibnet.ru${path}`;
  const redirect = await fetch(videoUrl, {
    headers: { ...PROVIDER_HEADERS, Referer: url },
    redirect: "manual",
  });

  const location = redirect.headers.get("location");
  if (location) return location.startsWith("//") ? `https:${location}` : location;
  if (redirect.ok) return videoUrl;
  return null;
}

async function extractWithPlaywright(url) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  let streamUrl = null;

  page.on("request", (req) => {
    const target = req.url();
    if (streamUrl) return;
    if (!target.includes(".m3u8") && !target.includes(".mp4")) return;
    if (target.includes("analytics") || target.includes("doubleclick")) return;
    streamUrl = target;
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

    const deadline = Date.now() + 15000;
    while (!streamUrl && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
  } finally {
    await browser.close();
  }

  return streamUrl;
}

async function extractStream(providerUrl) {
  const lower = providerUrl.toLowerCase();

  if (lower.includes("vidmoly")) {
    const stream = await extractVidmoly(providerUrl);
    if (stream) return stream;
  }

  if (lower.includes("sibnet")) {
    const stream = await extractSibnet(providerUrl);
    if (stream) return stream;
  }

  return extractWithPlaywright(providerUrl);
}

if (require.main === module) {
  const providerUrl = process.argv[2];
  if (!providerUrl) {
    console.error("Usage: node poc/extract.js <provider-embed-url>");
    process.exit(1);
  }

  extractStream(providerUrl)
    .then((url) => {
      if (!url) {
        console.error("Could not extract stream URL.");
        process.exit(1);
      }
      console.log(url);
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}

module.exports = { extractStream };
