/**
 * POC: Parse Episodes Data
 * Extracts video providers and their respective episode links from episodes.js
 */

async function getEpisodes(baseUrl) {
  const url = baseUrl.endsWith("episodes.js")
    ? baseUrl
    : baseUrl + "episodes.js";

  try {
    const response = await fetch(url);
    const code = await response.text();

    const providers = [];
    // Regex to find each array: var epsN = [ ... ];
    const arrayRegex = /var\s+eps(\d+)\s*=\s*\[([\s\S]*?)\];/g;

    let m = arrayRegex.exec(code);
    while (m !== null) {
      const id = m[1];
      const content = m[2];

      // Extract links within the array
      const links = content
        .split(",")
        .map((link) => link.trim().replace(/'/g, ""))
        .filter((link) => link.startsWith("http"));

      if (links.length > 0) {
        // Identify provider name from the first link
        let hostname = new URL(links[0]).hostname.replace("www.", "");

        // Vidmoly fix: .to is often blocked/broken, .biz is preferred for streaming
        const processedLinks =
          hostname === "vidmoly.to"
            ? links.map((link) => link.replace("vidmoly.to", "vidmoly.biz"))
            : links;

        if (hostname === "vidmoly.to") hostname = "vidmoly.biz";

        providers.push({
          id: parseInt(id),
          provider: hostname,
          count: processedLinks.length,
          episodes: processedLinks,
        });
      }
      m = arrayRegex.exec(code);
    }

    return {
      total_episodes: providers.length > 0 ? providers[0].count : 0,
      providers: providers,
    };
  } catch (error) {
    console.error("Error parsing episodes:", error);
    return null;
  }
}

// Direct test
const url =
  process.argv[2] ||
  "https://anime-sama.to/catalogue/jujutsu-kaisen/saison1/vostfr/episodes.js";
getEpisodes(url).then((res) => {
  if (res) console.log(JSON.stringify(res, null, 2));
});
