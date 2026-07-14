#!/usr/bin/env node
// Propagate a version into server.json (the official MCP registry manifest),
// which carries the version in two places: the top-level `version` and each
// entry in `packages[]`. package.json is owned by @semantic-release/npm; this
// script keeps server.json in lockstep so mcp-publisher validates cleanly.
//
// Usage: node scripts/sync-version.mjs [version]
//   With no argument, reads the version from package.json.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const version =
  process.argv[2] ??
  JSON.parse(readFileSync(root + "package.json", "utf8")).version;

if (!version) {
  console.error("[sync-version] no version provided and none in package.json");
  process.exit(1);
}

const path = root + "server.json";
const manifest = JSON.parse(readFileSync(path, "utf8"));
manifest.version = version;
if (Array.isArray(manifest.packages)) {
  for (const pkg of manifest.packages) pkg.version = version;
}
writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
console.error(`[sync-version] server.json -> ${version}`);
