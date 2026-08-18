const PROVIDERS = [
  "sibnet.ru",
  "filemoon",
  "sendvid.com",
  "vidmoly",
  "streamtape",
  "doodstream",
  "smoothpre",
  "lpayer",
  "embed4me",
  "minochinos",
  "dingtezuni",
  "bingezove",
  "movearnpre",
  "bysedikamoum",
  "weneverbeenfree",
  "voe.sx",
  "vmwesa.online",
];

function isProvider(url: string): boolean {
  return PROVIDERS.some((provider) => url.includes(provider));
}

export function decryptWatch2(watch2Url: string): string | null {
  try {
    const url = new URL(watch2Url);

    for (const [, value] of url.searchParams.entries()) {
      try {
        const base64Decoded = Buffer.from(value, "base64").toString("utf-8");
        if (!/^[0-9a-fA-F]+$/.test(base64Decoded) || base64Decoded.length % 2 !== 0) {
          continue;
        }

        const hexBuffer = Buffer.from(base64Decoded, "hex");

        for (let key = 0; key < 256; key++) {
          const decodedBytes = Buffer.alloc(hexBuffer.length);
          for (let i = 0; i < hexBuffer.length; i++) {
            decodedBytes[i] = hexBuffer[i] ^ key;
          }

          const decodedStr = decodedBytes.toString("utf-8");
          if (decodedStr.startsWith("http://") || decodedStr.startsWith("https://")) {
            if (isProvider(decodedStr)) {
              return decodedStr;
            }
          }
        }
      } catch {
        /* try next param */
      }
    }
  } catch {
    /* invalid url */
  }

  return null;
}

export function providerNameFromWatch2Url(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}
