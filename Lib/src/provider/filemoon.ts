import { chromium } from "playwright";
import type { ProviderContext, ExtractResult } from "./types.js";

export async function extractFilemoon(url: string, ctx: ProviderContext): Promise<ExtractResult | null> {
  const browser = await chromium.launch({
    headless: ctx.headless ?? true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  let streamUrl: string | null = null;

  const capture = (u: string) => {
    if (!streamUrl && u.includes("master.m3u8")) streamUrl = u;
  };

  page.on("request", (req) => capture(req.url()));

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(4000);
    await page.mouse.click(640, 360);

    const deadline = Date.now() + 25000;
    while (!streamUrl && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }

    await browser.close();
    if (!streamUrl) return null;
    return { streamUrl, type: "hls" };
  } catch (err) {
    await browser.close();
    throw err;
  }
}
