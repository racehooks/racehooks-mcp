#!/usr/bin/env bash
# Publish this server to the official MCP registry (registry.modelcontextprotocol.io).
# Run from CI as a semantic-release publishCmd, AFTER the npm package is published,
# because the registry validates the npm `mcpName` field against the live package.
#
# Ownership of the io.github.racehooks/* namespace is proven via GitHub OIDC, so this
# requires the workflow to grant `id-token: write`. Smithery and the downstream
# aggregators (Glama, PulseMCP, mcp.so, Docker MCP catalog, …) index from here / npm
# on their own schedule — there is no separate push for them.
set -euo pipefail

# The registry validates against the live npm package, and a fresh version can take
# minutes to appear there (a fixed 20 s sleep lost the race on 0.3.2). Poll npm until
# this exact version resolves, up to 5 minutes.
version=$(node -p "require('./package.json').version")
name=$(node -p "require('./package.json').name")
for i in $(seq 1 30); do
  if npm view "${name}@${version}" version >/dev/null 2>&1; then
    echo "[mcp-registry] ${name}@${version} is live on npm" >&2
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[mcp-registry] ${name}@${version} not visible on npm after 5 minutes" >&2
    exit 1
  fi
  sleep 10
done

echo "[mcp-registry] fetching latest mcp-publisher release" >&2
url=$(curl -sSL https://api.github.com/repos/modelcontextprotocol/registry/releases/latest \
  | grep -o '"browser_download_url": *"[^"]*linux_amd64.tar.gz"' | cut -d'"' -f4 | head -1)
if [ -z "$url" ]; then
  echo "[mcp-registry] could not resolve mcp-publisher download URL" >&2
  exit 1
fi
curl -sSL "$url" | tar xz mcp-publisher

echo "[mcp-registry] logging in via GitHub OIDC and publishing" >&2
./mcp-publisher login github-oidc
# npm's view and the registry's fetch can hit different CDN edges, so retry briefly.
for i in 1 2 3 4 5; do
  if ./mcp-publisher publish; then break; fi
  if [ "$i" -eq 5 ]; then exit 1; fi
  echo "[mcp-registry] publish attempt $i failed; retrying in 30s" >&2
  sleep 30
done

rm -f mcp-publisher
echo "[mcp-registry] done" >&2
