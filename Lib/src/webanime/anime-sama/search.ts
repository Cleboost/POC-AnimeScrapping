import { fetchText } from "../../shared/fetch.js";
import { decodeHtmlEntities } from "../shared/html.js";

export interface AnimeSamaSearchItem {
  url: string;
  img: string;
  title: string;
  sub: string;
}

export async function searchAnimeSama(query: string): Promise<AnimeSamaSearchItem[]> {
  const response = await fetch("https://anime-sama.to/template-php/defaut/fetch.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `query=${encodeURIComponent(query)}`,
  });

  const html = await response.text();
  const results: AnimeSamaSearchItem[] = [];
  const regex =
    /<a href="([^"]+)" class="asn-search-result">[\s\S]*?src="([^"]+)"[\s\S]*?title">([^<]+)<\/h3>[\s\S]*?subtitle">([^<]*)<\/p>/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      url: match[1],
      img: match[2],
      title: decodeHtmlEntities(match[3]),
      sub: decodeHtmlEntities(match[4]),
    });
  }

  return results;
}
