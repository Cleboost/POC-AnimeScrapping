/**
 * POC: Resolve watch2 URL to provider URL using XOR decryption
 * Input:  https://franime.fr/watch2/?a=...
 * Output: provider URL (e.g. https://vidmoly.biz/embed-xxx.html)
 */

const PROVIDERS = ["sibnet.ru", "filemoon", "sendvid", "vidmoly", "streamtape", "doodstream"];

function isProvider(url) {
  return PROVIDERS.some((p) => url.includes(p));
}

function decryptWatch2(watch2Url) {
  try {
    const url = new URL(watch2Url);
    for (const [paramName, value] of url.searchParams.entries()) {
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
        // Continue to check other parameters
      }
    }
  } catch (e) {
    // Invalid URL format
  }
  return null;
}

// Direct test
const watch2Url = process.argv[2] || "https://franime.fr/watch2/?a=NmQ2MTNkM2M2MDZmNjAzOTNhM2UzYzZmNjAzYjYwM2MzYTNjNmM2ZjZkNjEzYjZjNjk2YTZkNjkzYjZiNjk2OTZlM2EzYTYwMzk2ODZlM2Q2ZDZkNjk2MDZmNmQzYTZkNmUzZDYxM2I2MTZlM2UzYTZkM2QzZDZiNmMzZTYxNmQ2OTYxNjgzOTY5Mzk2YjZmM2I2ZDYwNjEzZTZhNmQ2YQ%3D%3D&b=MzAyYzJjMjgyYjYyNzc3NzJlMzEzYzNkMzc3NjJiMzEzYTM2M2QyYzc2MmEyZDc3MmIzMDNkMzQzNDc2MjgzMDI4NjcyZTMxM2MzZDM3MzEzYzY1NmQ2ZTZhNmE2ODY4NmY%3D&c=M2M2OTZiM2U2ZDZjNjEzOTYwNmYzYTNlM2MzYTNhNjk2ZDZkM2U2MDNiMzk2YTZiM2UzZDNiM2Q2YzNlNmE2YjYxNmQ2ZjZiNmUzZTY5Njg2ZjZkNjE2YzZlM2M2ZjZkM2QzOTZlM2QzZDY5Njg2OTNkNmEzYzZjNmQzZTZlNmMzZTZmNmMzYTZlNmIzYzYxNmUzYTZiNmM2ZjZmNmQ2MDYxNmM2OTNjNmQ2YTM5NmUzYjNhM2MzOTZiNmE%3D";
const result = decryptWatch2(watch2Url);
if (result) {
  console.log(result);
} else {
  console.error("Could not decrypt provider URL from watch2 URL.");
  process.exit(1);
}
