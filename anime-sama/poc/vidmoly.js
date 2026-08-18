/**
 * POC: Vidmoly Stream & Metadata Extractor
 * Extracts the direct .m3u8 stream and available video info
 */

async function extractVidmolyStream(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://anime-sama.to/",
      },
    });
    const html = await response.text();

    // Extract metadata using regex
    const streamMatch = html.match(/file:\s*'([^']+\.m3u8[^']*)'/);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const posterMatch = html.match(/image:\s*"([^"]+)"/);
    const durationMatch = html.match(/duration:\s*"(\d+)"/);
    const qualityMatch = html.match(/label:\s*"([^"]+)"/);

    if (streamMatch) {
      return {
        provider: "vidmoly",
        title: titleMatch ? titleMatch[1].trim() : null,
        poster: posterMatch ? posterMatch[1] : null,
        duration_seconds: durationMatch ? parseInt(durationMatch[1]) : null,
        quality_label: qualityMatch ? qualityMatch[1] : null,
        stream_url: streamMatch[1],
      };
    }

    return null;
  } catch (error) {
    console.error("Vidmoly extraction error:", error);
    return null;
  }
}

// Direct test
const url = process.argv[2] || "https://vidmoly.biz/embed-e6um2aain6bf.html";
extractVidmolyStream(url).then((res) => {
  if (res) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(
      "Could not extract stream. The link might be expired or protected.",
    );
  }
});
