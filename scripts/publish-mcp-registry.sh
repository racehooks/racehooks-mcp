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

# Give npm a moment to propagate the freshly published version before the registry
# fetches and validates it.
sleep 20

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
./mcp-publisher publish

rm -f mcp-publisher
echo "[mcp-registry] done" >&2
