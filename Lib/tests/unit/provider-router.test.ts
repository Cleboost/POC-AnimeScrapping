import { describe, expect, test } from "bun:test";
import { providerNameFromUrl } from "../../src/provider/index.js";
import { hostNeedsBrowser, httpHosts, browserHosts } from "../../src/providers.js";

describe("provider router", () => {
  test("providerNameFromUrl extrait hostname", () => {
    expect(providerNameFromUrl("https://www.vidmoly.biz/embed-x.html")).toBe("vidmoly.biz");
    expect(providerNameFromUrl("not-a-url")).toBe("not-a-url");
  });

  test("hostNeedsBrowser identifie filemoon", () => {
    expect(hostNeedsBrowser("filemoon")).toBe(true);
    expect(hostNeedsBrowser("vidmoly")).toBe(false);
    expect(httpHosts).toContain("vidmoly");
    expect(browserHosts).toContain("filemoon");
  });
});
