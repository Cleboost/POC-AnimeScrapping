/**
 * POC: Extract direct stream URL (.m3u8 / .mp4) from a provider embed URL
 */

const { BASE_URL, PROVIDER_HEADERS } = require("./headers");
const { resolveEmbedUrl } = require("./parse");

async function extractFromHtml(url, parentPageUrl = null) {
  const headers = {
    ...PROVIDER_HEADERS,
    Referer: parentPageUrl || BASE_URL,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) return null;

  const html = await res.text();
  if (html.length < 100 || /too many requests/i.test(html)) return null;

  const patterns = [
    /file:\s*["']([^"']+\.m3u8[^"']*)["']/,
    /sources:\s*\[\s*\{\s*file:\s*["']([^"']+)["']/,
    /hls2?:\s*["']([^"']+\.m3u8[^"']*)["']/,
    /"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
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

function captureStreamFromPage(page, onCapture) {
  const tryCapture = (target) => {
    if (onCapture.url) return;
    if (!target.includes(".m3u8") && !target.includes(".mp4")) return;
    if (
      target.includes("analytics") ||
      target.includes("doubleclick") ||
      target.includes("google") ||
      target.includes("facebook")
    ) {
      return;
    }
    onCapture.url = target;
  };

  page.on("request", (req) => tryCapture(req.url()));
  page.on("response", (res) => tryCapture(res.url()));
}

async function clickPlayer(page, selector = null) {
  try {
    if (selector) {
      const box = await page.locator(selector).boundingBox({ timeout: 5000 });
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        return;
      }
    }
  } catch {
    /* fallback to center click */
  }

  await page.mouse.click(640, 360);
}

async function extractFromWatchPage(parentPageUrl) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
  });

  const page = await browser.newPage();
  const capture = { url: null };
  captureStreamFromPage(page, capture);

  try {
    await page.goto(parentPageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(4000);
    await clickPlayer(page, "iframe");
    await page.waitForTimeout(2500);
    if (!capture.url) await clickPlayer(page, "iframe");

    const deadline = Date.now() + 20000;
    while (!capture.url && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
  } finally {
    await browser.close();
  }

  return capture.url;
}

async function extractWithPlaywright(embedUrl, parentPageUrl = null) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext({
    userAgent: PROVIDER_HEADERS["User-Agent"],
    extraHTTPHeaders: { Referer: parentPageUrl || BASE_URL },
  });
  const page = await context.newPage();
  const capture = { url: null };

  captureStreamFromPage(page, capture);

  context.on("page", async (popup) => {
    if (popup !== page) {
      try {
        await popup.close();
      } catch {
        /* ignore popup ads */
      }
    }
  });

  try {
    await page.goto(embedUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(4000);
    await clickPlayer(page);
    await page.waitForTimeout(2500);
    if (!capture.url) await clickPlayer(page);

    const deadline = Date.now() + 20000;
    while (!capture.url && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
  } finally {
    await browser.close();
  }

  return capture.url;
}

async function extractStream(embedUrl, options = {}) {
  const parentPageUrl = options.parentPageUrl || null;
  const resolvedUrl = resolveEmbedUrl(embedUrl);
  const lower = embedUrl.toLowerCase();
  const resolvedLower = resolvedUrl.toLowerCase();

  if (lower.includes("vidmoly") || resolvedLower.includes("ansembed")) {
    const stream = await extractFromHtml(resolvedUrl, parentPageUrl);
    if (stream) return stream;
  }

  if (lower.includes("sibnet")) {
    const stream = await extractSibnet(embedUrl);
    if (stream) return stream;
  }

  if (parentPageUrl) {
    const fromPage = await extractFromWatchPage(parentPageUrl);
    if (fromPage) return fromPage;
  }

  return extractWithPlaywright(resolvedUrl, parentPageUrl);
}

async function extractStreamFromSources(sources, options = {}) {
  const parentPageUrl = options.parentPageUrl || null;
  const startIndex = options.providerIndex ?? 0;

  for (let i = startIndex; i < sources.length; i++) {
    const source = sources[i];
    const stream = await extractStream(source.resolvedEmbedUrl || source.embedUrl, {
      parentPageUrl,
    });
    if (stream) return { stream, source, providerIndex: i };
  }

  for (let i = 0; i < startIndex; i++) {
    const source = sources[i];
    const stream = await extractStream(source.resolvedEmbedUrl || source.embedUrl, {
      parentPageUrl,
    });
    if (stream) return { stream, source, providerIndex: i };
  }

  return null;
}

if (require.main === module) {
  const embedUrl = process.argv[2];
  const parentPageUrl = process.argv[3] || null;

  if (!embedUrl) {
    console.error("Usage: node poc/extract.js <provider-embed-url> [parent-page-url]");
    process.exit(1);
  }

  extractStream(embedUrl, { parentPageUrl })
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

module.exports = { extractStream, extractStreamFromSources, resolveEmbedUrl };
