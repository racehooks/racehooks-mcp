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

Claude Code (Claude Code does not read MCP servers from `.claude/settings.json`):

```bash
claude mcp add racehooks -e RACEHOOKS_CLIENT_ID=… -e RACEHOOKS_CLIENT_SECRET=… -- npx -y @racehooks/mcp
```

## What it exposes

- **Tools (59):** live session + events, post-race insights, races, history (drivers /
  constructors / circuits / seasons), telemetry, fantasy, and account / usage / webhooks — see the
  README for the full table and the plan each tool needs. The six simulation tools
  (`start_simulation` … `cancel_simulation`) call a retired endpoint and currently return 404;
  `get_billing_plan` currently returns 401 with API credentials.
- **Resources (7):** `racehooks://feeds`, `racehooks://live`, `racehooks://webhooks`,
  `racehooks://usage`, `racehooks://drivers`, `racehooks://circuits`, `racehooks://seasons`.
- **Prompts (6):** `setup_race_event_webhook`, `setup_fantasy_scoring_webhook`,
  `check_account_health`, `analyze_race_strategy`, `compare_drivers`, `explain_ml_predictions`.

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
