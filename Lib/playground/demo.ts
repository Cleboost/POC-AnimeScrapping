/**
 * Playground — démo locale de l'implémentation.
 *
 * Import depuis src/ (dev). En prod tu ferais pareil avec le bundle :
 *   import { Anime } from "../lib/anime-scraping-lib.js";
 */

import { Anime } from "../src/index.ts";

function parseArgs(argv: string[]) {
  const options: {
    query?: string;
    pick: number;
    season: number;
    episode: number;
    lang: string;
    headless: boolean;
    searchOnly: boolean;
  } = {
    pick: 1,
    season: 1,
    episode: 1,
    lang: "vostfr",
    headless: true,
    searchOnly: false,
  };

  const queryParts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--pick") options.pick = parseInt(argv[++i], 10);
    else if (arg === "--season") options.season = parseInt(argv[++i], 10);
    else if (arg === "--episode") options.episode = parseInt(argv[++i], 10);
    else if (arg === "--lang") options.lang = argv[++i];
    else if (arg === "--headful") options.headless = false;
    else if (arg === "--search-only") options.searchOnly = true;
    else if (!arg.startsWith("--")) queryParts.push(arg);
  }

  options.query = queryParts.join(" ").trim() || undefined;
  return options;
}

function printHelp() {
  console.log(`
Playground anime-scraping-lib

Usage:
  bun run playground [query] [options]

Options:
  --pick N          Résultat à watch (défaut: 1)
  --season N        Saison (défaut: 1)
  --episode N       Épisode (défaut: 1)
  --lang vostfr|vf  Langue (défaut: vostfr)
  --headful         Playwright avec UI (debug providers browser)
  --search-only     Ne fait que search(), pas watch()

Exemples:
  bun run playground "one piece"
  bun run playground "naruto" --pick 2 --season 1 --episode 3
  bun run playground "solo leveling" --search-only
`);
}

function line(char = "─", width = 60) {
  console.log(char.repeat(width));
}

function printSearch(results: Awaited<ReturnType<Anime["search"]>>) {
  line();
  console.log(`🔍 Search: "${results.query}" — ${results.count} résultat(s)\n`);

  if (results.count === 0) {
    console.log("Rien trouvé.");
    return;
  }

  for (const r of results.results) {
    console.log(`  [${r.id}] ${r.title}`);
    console.log(`      platforms: ${r.platforms.join(", ")}`);
    if (r.subtitle) console.log(`      ${r.subtitle.slice(0, 70)}${r.subtitle.length > 70 ? "…" : ""}`);
    if (r.poster) console.log(`      poster: ${r.poster}`);
    console.log();
  }

  line();
  console.log("→ watch avec: bun run playground \"…\" --pick <id> --season 1 --episode 1");
}

function printWatch(watch: Awaited<ReturnType<Anime["watch"]>>) {
  line();
  console.log(`▶ Watch #${watch.id} — ${watch.title}`);
  console.log(`  ${watch.platforms.join(", ")} | S${watch.season} E${watch.episode} | ${watch.lang}\n`);

  if (watch.sources.length === 0) {
    console.log("Aucune source.");
    return;
  }

  for (const src of watch.sources) {
    const status = src.error ? `❌ ${src.error}` : `✅ ${src.quality.label}`;
    console.log(`  • [${src.platform}] ${src.provider} (${src.type}) — ${status}`);
    if (!src.error && src.streamUrl) {
      console.log(`    ${src.streamUrl.slice(0, 90)}${src.streamUrl.length > 90 ? "…" : ""}`);
    }
    if (src.variants?.length) {
      console.log(`    variants: ${src.variants.map((v) => v.label).join(", ")}`);
    }
  }

  console.log();
  if (watch.best && !watch.best.error) {
    console.log("⭐ Best:");
    console.log(`   platform: ${watch.best.platform}`);
    console.log(`   provider: ${watch.best.provider}`);
    console.log(`   quality:  ${watch.best.quality.label} (${watch.best.quality.height ?? "?"}p)`);
    console.log(`   url:      ${watch.best.streamUrl}`);
  } else {
    console.log("⭐ Aucune source optimale disponible.");
  }
  line();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.query) {
    printHelp();
    process.exit(0);
  }

  const anime = new Anime({ headless: args.headless });

  console.log("\n🎬 anime-scraping-lib playground\n");

  const search = await anime.search(args.query);
  printSearch(search);

  if (args.searchOnly || search.count === 0) return;

  if (args.pick < 1 || args.pick > search.count) {
    console.error(`\n❌ pick=${args.pick} invalide (1–${search.count})`);
    process.exit(1);
  }

  console.log(`\n⏳ Résolution sources pour #${args.pick}… (peut prendre quelques secondes)\n`);

  const watch = await anime.watch(args.pick, {
    season: args.season,
    episode: args.episode,
    lang: args.lang,
  });

  printWatch(watch);
}

main().catch((err) => {
  console.error("\n❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
