import { chromium } from "playwright";
import type { ProviderContext, ExtractResult } from "./types.js";

export async function extractWithBrowser(
  url: string,
  ctx: ProviderContext,
): Promise<ExtractResult | null> {
  const browser = await chromium.launch({
    headless: ctx.headless ?? true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  context.on("page", async (popup) => {
    if (popup !== page) {
      try {
        await popup.close();
      } catch {
        /* ignore */
      }
    }
  });

  const capture = { url: null as string | null };

  page.on("request", (req) => {
    const u = req.url();
    if (
      !capture.url &&
      (u.includes(".m3u8") || u.includes(".mp4")) &&
      !u.includes("analytics") &&
      !u.includes("doubleclick") &&
      !u.includes("google")
    ) {
      capture.url = u;
    }
  });

  try {
    if (ctx.parentPageUrl) {
      await page.goto(ctx.parentPageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      await page.evaluate((iframeUrl) => {
        const container =
          document.getElementById("chapter-video-frame") || document.body;
        container.innerHTML = `<iframe id="scrapper-frame" src="${iframeUrl}" width="100%" height="450px" allowfullscreen></iframe>`;
      }, url);

      await page.waitForTimeout(5000);
      await page.bringToFront();

      const iframeBoundingBox = await page.locator("iframe#scrapper-frame").boundingBox();
      if (iframeBoundingBox) {
        const x = iframeBoundingBox.x + iframeBoundingBox.width / 2;
        const y = iframeBoundingBox.y + iframeBoundingBox.height / 2;
        await page.mouse.click(x, y);
        await page.waitForTimeout(2500);
        if (!capture.url) {
          await page.mouse.click(x, y);
        }
      }
    } else {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(4000);
      await page.bringToFront();

      if (!capture.url) {
        await page.mouse.click(640, 360);
        await page.waitForTimeout(2500);
        if (!capture.url) {
          await page.mouse.click(640, 360);
        }
      }
    }

    const deadline = Date.now() + 15000;
    while (!capture.url && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }

    await browser.close();
    if (!capture.url) return null;

    const type: "hls" | "mp4" = capture.url.includes(".m3u8") ? "hls" : "mp4";
    return { streamUrl: capture.url, type };
  } catch (err) {
    await browser.close();
    throw err;
  }
}
