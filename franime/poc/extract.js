/**
 * POC: Extract direct stream URL (.m3u8 / .mp4) from a provider embed URL
 */

const { PROVIDER_HEADERS } = require("./headers");

async function extractVidmoly(url) {
  const res = await fetch(url, { headers: PROVIDER_HEADERS });
  const html = await res.text();
  const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
  return m ? m[1] : null;
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
  if (location) {
    return location.startsWith("//") ? `https:${location}` : location;
  }

  if (redirect.ok) return videoUrl;
  return null;
}

async function extractSendvid(url) {
  const res = await fetch(url, { headers: PROVIDER_HEADERS });
  const html = await res.text();
  const m = html.match(/source\s+src="([^"]+\.(?:m3u8|mp4)[^"]*)"|file:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/);
  return m ? (m[1] || m[2]) : null;
}

async function extractStream(providerUrl) {
  if (providerUrl.includes("vidmoly")) return extractVidmoly(providerUrl);
  if (providerUrl.includes("sibnet")) return extractSibnet(providerUrl);
  if (providerUrl.includes("sendvid")) return extractSendvid(providerUrl);
  throw new Error(`Unsupported provider for HTTP extraction: ${providerUrl}`);
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
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { extractStream };
