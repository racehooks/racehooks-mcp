import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

// Single source of truth for the version: package.json. Injected at build time
// so src never hardcodes it (see __MCP_VERSION__ in src/index.ts).
const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: "es2022",
  define: {
    __MCP_VERSION__: JSON.stringify(version),
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
