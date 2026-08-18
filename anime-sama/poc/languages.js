/**
 * POC: Language Discovery by Probing (HEAD requests)
 * Checks which language paths actually exist (status 200) vs 404
 */

const POSSIBLE_LANGS = [
  "vostfr",
  "vf",
  "vf1",
  "vf2",
  "va",
  "vj",
  "vkr",
  "vcn",
  "var",
  "vqc",
];

async function getAvailableLanguages(url) {
  // Get parent URL (e.g., .../jujutsu-kaisen/saison1/)
  const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  const parentUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/")) + "/";

  const probes = POSSIBLE_LANGS.map(async (lang) => {
    const testUrl = `${parentUrl}${lang}/`;
    try {
      const response = await fetch(testUrl, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (response.ok) {
        return { lang: lang.toUpperCase(), url: testUrl };
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  });

  const results = await Promise.all(probes);
  return results.filter((res) => res !== null);
}

// Direct test
const url =
  process.argv[2] ||
  "https://anime-sama.to/catalogue/jujutsu-kaisen/saison1/vostfr/";
getAvailableLanguages(url).then((res) => {
  console.log(JSON.stringify(res, null, 2));
});
