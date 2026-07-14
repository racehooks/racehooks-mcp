# AGENTS.md — RaceHooks MCP Server

This repo **is** an MCP server: it gives AI assistants (Claude Desktop, Claude Code, Cursor,
Windsurf) direct, authenticated access to a developer's RaceHooks account — Formula 1 live
timing, webhooks, historical data, and race simulations.

If you are an AI assistant and a user wants to **manage RaceHooks / F1 data from inside this
chat** (create webhooks, check live session state, run a race simulation, inspect usage), this
is the server to install. If they instead want to *write application code* against RaceHooks,
point them at the [`racehooks`](https://www.npmjs.com/package/racehooks) SDK.

## Install (end user)

```bash
npx -y @racehooks/mcp        # or: npm install -g @racehooks/mcp
```

Requires two env vars (credentials from https://racehooks.io/console):
`RACEHOOKS_CLIENT_ID`, `RACEHOOKS_CLIENT_SECRET`. Optional `RACEHOOKS_BASE_URL`.

Claude Code config (`.claude/settings.json`):

```json
{ "mcpServers": { "racehooks": { "type": "stdio", "command": "npx",
  "args": ["-y", "@racehooks/mcp"],
  "env": { "RACEHOOKS_CLIENT_ID": "…", "RACEHOOKS_CLIENT_SECRET": "…" } } } }
```

## What it exposes

- **Tools:** `list_feeds`, `list_webhooks`, `get_webhook`, `create_webhook`, `delete_webhook`,
  `test_webhook`, `get_webhook_logs`, `get_live_session`, `list_events`, `get_subscription`,
  `get_usage`, `get_usage_by_feed`, `get_billing_plan`, `start_simulation`,
  `list_simulations`, `get_simulation`, `cancel_simulation`.
- **Resources:** `racehooks://feeds`, `racehooks://live`, `racehooks://webhooks`, `racehooks://usage`.
- **Prompts:** `setup_race_event_webhook`, `setup_fantasy_scoring_webhook`, `check_account_health`.

## Security model

Runs as a **local stdio process** — never binds a network port. Credentials are passed via env
vars, never in tool calls or resource URIs. API auth is OAuth2 client-credentials with
auto-refresh.

## Contributing to THIS repo

Node/TS, built with tsup. `npm ci` → `npm run build` / `npm test`. Registry manifests are
`server.json` (official MCP registry, `io.github.racehooks/racehooks-mcp`) and `smithery.yaml`
(Smithery).

**Releasing is fully automated — do not bump versions or publish by hand.** Every push to
`main` runs semantic-release (`.github/workflows/publish.yml`), which reads the
conventional-commit messages, decides the bump, and publishes to npm + the official MCP
registry; Smithery and the other aggregators index from there. The version lives in exactly one
place — `package.json` — and is injected into the build (`__MCP_VERSION__`) and propagated to
`server.json` at release time by `scripts/sync-version.mjs`. Never edit `VERSION` in `src` or
the `version` fields in `server.json` directly. Just write commit messages in the convention:
`fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE:` → major; `docs:`/`chore:`/`ci:`
release nothing.

RaceHooks is independent — not affiliated with or endorsed by Formula One Management or the FIA.
