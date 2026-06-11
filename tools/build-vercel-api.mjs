import { build } from "esbuild";

await build({
  entryPoints: ["server/vercelHandler.ts"],
  outfile: "api/index.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
  sourcemap: false,
});
