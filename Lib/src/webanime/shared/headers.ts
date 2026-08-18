export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const ANIME_SAMA_HEADERS = {
  "User-Agent": USER_AGENT,
};

export const VOIRANIME_HEADERS = {
  "User-Agent": USER_AGENT,
  Referer: "https://voir-anime.to/",
};

export const FRANIME_API_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "application/json, text/plain, */*",
  Origin: "https://franime.fr",
  Referer: "https://franime.fr/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

export const FRANIME_PROVIDER_REFERER = "https://franime.fr/";

export const NAKANIME_API_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
  Referer: "https://nakanime.tv/",
};

export const NAKANIME_PROVIDER_REFERER = "https://nakanime.tv/";

export function refererForPlatform(
  platform: "anime-sama" | "voiranime" | "franime" | "nakanime",
): string {
  switch (platform) {
    case "anime-sama":
      return "https://anime-sama.to/";
    case "voiranime":
      return "https://voir-anime.to/";
    case "franime":
      return FRANIME_PROVIDER_REFERER;
    case "nakanime":
      return NAKANIME_PROVIDER_REFERER;
  }
}
