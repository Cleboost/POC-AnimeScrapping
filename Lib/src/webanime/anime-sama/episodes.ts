import { fetchText } from "../../shared/fetch.js";

export interface EpisodeProvider {
  id: number;
  provider: string;
  episodes: string[];
}

export async function getEpisodeProviders(langUrl: string): Promise<EpisodeProvider[]> {
  const url = langUrl.endsWith("episodes.js")
    ? langUrl
    : langUrl.endsWith("/")
      ? langUrl + "episodes.js"
      : langUrl + "/episodes.js";

  const code = await fetchText(url);
  const providers: EpisodeProvider[] = [];
  const arrayRegex = /var\s+eps(\d+)\s*=\s*\[([\s\S]*?)\];/g;

  let match: RegExpExecArray | null;
  while ((match = arrayRegex.exec(code)) !== null) {
    const id = match[1];
    const content = match[2];
    const links = content
      .split(",")
      .map((link) => link.trim().replace(/'/g, ""))
      .filter((link) => link.startsWith("http"));

    if (links.length === 0) continue;

    let hostname = new URL(links[0]).hostname.replace("www.", "");
    const processedLinks =
      hostname === "vidmoly.to"
        ? links.map((link) => link.replace("vidmoly.to", "vidmoly.biz"))
        : links;

    if (hostname === "vidmoly.to") hostname = "vidmoly.biz";

    providers.push({
      id: parseInt(id, 10),
      provider: hostname,
      episodes: processedLinks,
    });
  }

  return providers;
}
