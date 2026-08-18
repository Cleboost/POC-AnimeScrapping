/**
 * POC: Resolve watch2 URL to provider URL using XOR decryption
 * Input:  https://franime.fr/watch2/?a=...
 * Output: provider URL (e.g. https://vidmoly.biz/embed-xxx.html)
 */

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

function isProvider(url) {
  return PROVIDERS.some((provider) => url.includes(provider));
}

function decryptWatch2(watch2Url) {
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
      } catch (e) {
        // Try next parameter
      }
    }
  } catch (e) {
    // Invalid URL
  }

  return null;
}

if (require.main === module) {
  const watch2Url = process.argv[2];
  if (!watch2Url) {
    console.error('Usage: node poc/watch2.js "https://franime.fr/watch2/?a=..."');
    process.exit(1);
  }

  const result = decryptWatch2(watch2Url);
  if (result) {
    console.log(result);
  } else {
    console.error("Could not decrypt provider URL from watch2 URL.");
    process.exit(1);
  }
}

module.exports = { decryptWatch2 };
