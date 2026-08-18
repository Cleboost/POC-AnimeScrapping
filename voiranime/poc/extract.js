/**
 * POC: Extract direct stream URL (.m3u8 / .mp4) from a provider embed URL
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://voir-anime.to/"
};

async function extractVidmoly(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Vidmoly HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)['"]/);
  return m ? m[1] : null;
}

async function extractGenericPlaywright(url, parentPageUrl = null) {
  const { chromium } = require("playwright");

  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  context.on("page", async (popup) => {
    if (popup !== page) {
      try {
        await popup.close();
      } catch (e) {}
    }
  });

  let streamUrl = null;

  page.on("request", (req) => {
    const u = req.url();
    if (!streamUrl && (u.includes(".m3u8") || u.includes(".mp4"))) {
      if (!u.includes("analytics") && !u.includes("doubleclick") && !u.includes("google")) {
        streamUrl = u;
      }
    }
  });

  try {
    if (parentPageUrl) {
      await page.goto(parentPageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      
      await page.evaluate((iframeUrl) => {
        const container = document.getElementById("chapter-video-frame") || document.body;
        container.innerHTML = `<iframe id="scrapper-frame" src="${iframeUrl}" width="100%" height="450px" allowfullscreen></iframe>`;
      }, url);

      await page.waitForTimeout(5000);
      await page.bringToFront();

      const iframeBoundingBox = await page.locator("iframe#scrapper-frame").boundingBox();
      if (iframeBoundingBox) {
        const x = iframeBoundingBox.x + iframeBoundingBox.width / 2;
        const y = iframeBoundingBox.y + iframeBoundingBox.height / 2;
        
        console.log("Clicking player (Attempt 1)...");
        await page.mouse.click(x, y);
        await page.waitForTimeout(2500);

        if (!streamUrl) {
          console.log("Clicking player (Attempt 2)...");
          await page.mouse.click(x, y);
        }
      }
    } else {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.bringToFront();
      
      if (!streamUrl) {
        await page.mouse.click(640, 360);
        await page.waitForTimeout(2500);
        if (!streamUrl) {
          await page.mouse.click(640, 360);
        }
      }
    }

    const deadline = Date.now() + 15000;
    while (!streamUrl && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
    
    await browser.close();
    return streamUrl;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function extractStream(providerUrl, parentPageUrl = null) {
  if (providerUrl.includes("vidmoly")) {
    try {
      const fastUrl = await extractVidmoly(providerUrl);
      if (fastUrl) return fastUrl;
    } catch (e) {}
  }
  return extractGenericPlaywright(providerUrl, parentPageUrl);
}

const providerUrl = process.argv[2] || "https://voe.sx/e/hhpf4exfwjef";
const parentPageUrl = process.argv[3] || null;

extractStream(providerUrl, parentPageUrl)
  .then((url) => {
    if (url) {
      console.log("\nSuccess! Stream URL extracted:");
      console.log(url);
    } else {
      console.error("\nFailed to extract stream URL.");
    }
  })
  .catch((err) => console.error("Error:", err));



