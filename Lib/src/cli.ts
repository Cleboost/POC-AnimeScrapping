#!/usr/bin/env bun
import { Anime } from "./client.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !["search", "watch", "play"].includes(command)) {
    console.log("Usage:");
    console.log("  anime-scrap search <query>");
    console.log("  anime-scrap play <query> [--pick N] [--season N] [--episode N] [--lang vostfr|vf]");
    console.log("  anime-scrap watch <id> [--season N] [--episode N] [--lang vostfr|vf]  (same process session only)");
    process.exit(1);
  }

  const anime = new Anime({ headless: true });

  function parseOptions(startIndex: number) {
    const options: { season?: number; episode?: number; lang?: string; pick?: number } = {};
    for (let i = startIndex; i < args.length; i++) {
      if (args[i] === "--season") options.season = parseInt(args[++i], 10);
      if (args[i] === "--episode") options.episode = parseInt(args[++i], 10);
      if (args[i] === "--lang") options.lang = args[++i];
      if (args[i] === "--pick") options.pick = parseInt(args[++i], 10);
    }
    return options;
  }

  if (command === "search") {
    const query = args.slice(1).join(" ");
    if (!query) {
      console.error("Missing search query");
      process.exit(1);
    }
    const result = await anime.search(query);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "play") {
    const queryParts: string[] = [];
    let i = 1;
    while (i < args.length && !args[i].startsWith("--")) {
      queryParts.push(args[i++]);
    }
    const query = queryParts.join(" ");
    if (!query) {
      console.error("Missing search query");
      process.exit(1);
    }
    const { pick = 1, season, episode, lang } = parseOptions(i);
    const searchResult = await anime.search(query);
    if (searchResult.count === 0) {
      console.error("No results");
      process.exit(1);
    }
    const watchResult = await anime.watch(pick, { season, episode, lang });
    console.log(JSON.stringify(watchResult, null, 2));
    return;
  }

  const id = parseInt(args[1], 10);
  if (!id) {
    console.error("Missing or invalid id");
    process.exit(1);
  }

  const { season, episode, lang } = parseOptions(2);
  const result = await anime.watch(id, { season, episode, lang });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
