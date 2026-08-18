import dts from "rollup-plugin-dts";

export default {
  input: "src/index.ts",
  output: [{ file: "dist/anime-scraping-lib.d.ts", format: "es" }],
  plugins: [dts()],
};
