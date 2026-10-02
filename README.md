# @racehooks/mcp

MCP server for [RaceHooks](https://racehooks.io) — gives AI assistants (Claude, Cursor, Windsurf) direct access to RaceHooks motorsport analytics and data.

[![npm](https://img.shields.io/npm/v/@racehooks/mcp)](https://www.npmjs.com/package/@racehooks/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> RaceHooks is an independent service and is not affiliated with or endorsed by Formula One Management or the FIA. "Formula 1," "F1," and related marks are trademarks of Formula One Licensing BV.

## What this does

Exposes your [RaceHooks](https://racehooks.io) account to an AI assistant as **59 tools**, **7 resources**, and **6 guided prompts**. Every call is made with your account's credentials, so what a tool returns depends on your plan (Free, Developer, or Custom). The data tools cover Formula 1.

> **Simulation tools are being updated.** The six session-replay tools in this release (`start_simulation`, `list_simulations`, `get_simulation`, `pause_simulation`, `resume_simulation`, `cancel_simulation`) call an API endpoint that has been retired, so they currently return 404. Replacement tools are in progress; until they ship, use the console to replay sessions.

### Tools

**Live**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `get_live_session` | Current session state: flag, lap, running order, intervals, tyres, race control messages. Empty when nothing is live. | — | All (Free gets the latest milestone classification instead of live timing) |
| `list_events` | Race weekends with session schedules and status. | `year`, `upcoming`, `limit` | All |

**Post-race insights**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `list_insight_races` | Races with a completed post-race analytics bundle. | `season` | All |
| `get_race_insights` | Per-driver, per-lap model outputs (pit, safety car, overtake, undercut, tyre health, cliff risk, LTOE, win probability, expected points) plus pit stops, stints, and lap times. | `raceId` | All (Free gets tyre state only; strategic predictions need Developer+) |
| `get_model_meta` | Public model manifest: what each model predicts, model family, calibration tier, last trained. | — | All |
| `get_session_analytics` | Per-lap analytics snapshot for a session. | `sessionId` | Developer+ |
| `get_race_summary` | Post-race analytics status and aggregate telemetry metrics. | `raceId` | All (aggregates need Developer+) |

**Races**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `get_race` | Race details with results and qualifying grid. | `raceId` | All (timing fields need Developer+) |
| `get_race_qualifying` | Qualifying results. | `raceId` | All (Q1/Q2/Q3 times need Developer+) |
| `get_race_pitstops` | Pit stop records (driver, stop, lap, duration). | `raceId` | All |
| `get_race_tyres` | Tyre stints (compound, lap range, tyre age). | `raceId` | All |
| `get_race_weather` | Lap-by-lap weather. | `raceId` | All |
| `get_race_laps` | Per-lap times and positions. | `raceId`, `driverId` | Developer+ |
| `get_event_pace` | Practice and qualifying pace summary per driver. | `eventId` | Developer+ |

**History (drivers, constructors, circuits, seasons)**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `list_drivers` | Drivers, searchable. | `search`, `nationality`, `active`, `limit`, `offset` | All (page size 25 on Free, 100 paid) |
| `get_driver` | Driver profile with career stats. | `driverId` | All |
| `get_driver_results` | Race-by-race results for a driver. | `driverId`, `season` | All (timing fields need Developer+) |
| `get_driver_standings` | Championship standings history for a driver. | `driverId`, `season` | All |
| `list_constructors` | Constructors. | `lineage`, `active`, `limit`, `offset` | All |
| `get_constructor` | Constructor profile with lineage history. | `constructorId` | All |
| `get_constructor_results` | Race-by-race results for a constructor. | `constructorId`, `season` | All (timing fields need Developer+) |
| `get_constructor_standings` | Championship standings history for a constructor. | `constructorId`, `season` | All |
| `list_circuits` | Circuits with location. | `country`, `limit`, `offset` | All |
| `get_circuit` | Circuit details and analytics. | `circuitId` | All |
| `list_seasons` | Seasons with race counts. | — | All |
| `get_season_standings` | Final driver and constructor standings for a season. | `year` | All |
| `get_season_races` | Races in a season. | `year` | All |

**Telemetry**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `get_telemetry_laps` | Per-lap telemetry aggregates (speed, throttle, brake, DRS, aggression). | `raceId`, `driverId`, `lapNumber` | Developer+ |
| `get_telemetry_driver_laps` | Per-lap telemetry for one driver. | `raceId`, `driverId` | Developer+ |
| `get_telemetry_lap_comparison` | Every driver's telemetry for one lap. | `raceId`, `lapNumber` | Developer+ |
| `get_telemetry_race_summary` | Race-level telemetry summary. | `raceId` | Developer+ |
| `get_race_telemetry_laps` | Per-lap telemetry metrics from the race data API. | `raceId`, `driverId` | Developer+ |
| `get_race_telemetry_stints` | Per-stint telemetry and degradation slopes. | `raceId`, `driverId` | Custom |
| `get_race_telemetry_aggression` | Driver aggression index rankings. | `raceId` | Custom |

**Fantasy**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `get_fantasy_scores` | Estimated F1 Fantasy points per driver with full breakdown. | `raceId` | Developer+ |
| `get_fantasy_pit_times` | Pit-stop time leaderboard (stationary time) for a session. | `sessionId` | Developer+ |

**Account, usage and webhooks**

| Tool | What it does | Key args | Plan |
|---|---|---|---|
| `list_feeds` | Feed catalog with the plan each feed requires. | `limit` | All |
| `list_webhooks` | Webhook subscriptions on the account. | `limit`, `offset` | All |
| `get_webhook` | One webhook by ID. | `webhookId` | All |
| `create_webhook` | Create a webhook; returns the signing secret once. | `feedId`, `webhookUrl`, `webhookMethod`, `filters` | All |
| `update_webhook` | Change URL, method, or filters; pause/resume with `active`. | `webhookId`, `webhookUrl`, `filters`, `active` | All |
| `delete_webhook` | Delete a webhook. | `webhookId` | All |
| `test_webhook` | Send a test payload now. | `webhookId` | All |
| `get_webhook_logs` | Recent delivery logs. | `webhookId`, `limit` | All |
| `get_webhook_secret` | Current signing secret. | `webhookId` | All |
| `rotate_webhook_secret` | Rotate the signing secret (old one stops working immediately). | `webhookId` | All |
| `get_subscription` | Tier, plan limits, and usage snapshot. | — | All |
| `get_usage` | Deliveries and failures this period, remaining bucket. | — | All |
| `get_usage_by_feed` | Deliveries by feed this period. | — | All |
| `get_usage_latency` | Delivery latency percentiles by feed. | — | All |
| `get_usage_hourly` | Hourly deliveries for the last 24 hours. | — | All |
| `get_usage_history` | Delivery history across past periods. | — | All |
| `get_billing_plan` | Current plan, limits, usage this period, and billing period dates. | — | All |

**Simulation (currently unavailable — see note above):** `start_simulation`, `list_simulations`, `get_simulation`, `pause_simulation`, `resume_simulation`, `cancel_simulation`.

### Resources (read-only context)

- `racehooks://feeds` — full [feed catalog](https://racehooks.io/docs/feeds)
- `racehooks://live` — current live session state
- `racehooks://webhooks` — all webhook subscriptions
- `racehooks://usage` — current delivery usage
- `racehooks://drivers` — current-season driver roster
- `racehooks://circuits` — circuits with location
- `racehooks://seasons` — seasons with race counts

### Prompts (guided workflows)

- `setup_race_event_webhook` — create an `events.race` subscription with filters
- `setup_fantasy_scoring_webhook` — create a fantasy-optimised subscription
- `check_account_health` — full account health summary
- `analyze_race_strategy` — pit strategy, tyre management, and model predictions for one race
- `compare_drivers` — two drivers head-to-head across a race
- `explain_ml_predictions` — what the models predicted vs what happened in the latest analysed race

## Installation

```bash
npm install -g @racehooks/mcp
```

Or run directly with npx:

```bash
npx @racehooks/mcp
```

Get your API credentials at [racehooks.io](https://racehooks.io).

## Configuration

Two environment variables are required; the server exits on start-up without them:

```bash
export RACEHOOKS_CLIENT_ID="your-client-id"
export RACEHOOKS_CLIENT_SECRET="your-client-secret"
# Optional — defaults to https://api.racehooks.io
export RACEHOOKS_BASE_URL="https://api.racehooks.io"
```

## Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "racehooks": {
      "command": "npx",
      "args": ["-y", "@racehooks/mcp"],
      "env": {
        "RACEHOOKS_CLIENT_ID": "your-client-id",
        "RACEHOOKS_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Claude Code

Claude Code does not read MCP servers from `.claude/settings.json`. Add the server with the CLI:

```bash
claude mcp add racehooks \
  -e RACEHOOKS_CLIENT_ID=your-client-id \
  -e RACEHOOKS_CLIENT_SECRET=your-client-secret \
  -- npx -y @racehooks/mcp
```

Add `--scope project` to write it to a shared `.mcp.json` in your project, or `--scope user` to make it available in every project. To check the file in without committing secrets, reference environment variables in `.mcp.json`:

```json
{
  "mcpServers": {
    "racehooks": {
      "command": "npx",
      "args": ["-y", "@racehooks/mcp"],
      "env": {
        "RACEHOOKS_CLIENT_ID": "${RACEHOOKS_CLIENT_ID}",
        "RACEHOOKS_CLIENT_SECRET": "${RACEHOOKS_CLIENT_SECRET}"
      }
    }
  }
}
```

## Cursor / Windsurf

Add to your MCP config (`.cursor/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "racehooks": {
      "command": "npx",
      "args": ["-y", "@racehooks/mcp"],
      "env": {
        "RACEHOOKS_CLIENT_ID": "your-client-id",
        "RACEHOOKS_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Example usage with Claude

Once configured, you can ask Claude things like:

> "Check my RaceHooks account health"

> "Create an `events.race` webhook for https://myapp.com/hook, filtering for Ferrari only"

> "Compare VER and NOR tyre degradation in the last race"

> "Show me which feeds are using the most delivery quota today"

> "Set up a fantasy scoring webhook for my VER, NOR, LEC team at https://scoring.myapp.com/hook"

## Security

The MCP server runs as a local stdio process — it never binds a network port. Your credentials are passed via environment variables, are sent only to the RaceHooks API (to obtain an access token), and are never included in tool calls or resource URIs.

All API calls are authenticated using OAuth 2 client credentials (token auto-refreshes before expiry).

## Links

- [RaceHooks console](https://racehooks.io/console) — sign up and manage your account
- [RaceHooks API documentation](https://racehooks.io/docs)
- [Webhook API reference](https://racehooks.io/docs/webhooks)
- [Feed catalog](https://racehooks.io/docs/feeds)
- [GitHub](https://github.com/racehooks/racehooks-mcp)
- [npm](https://www.npmjs.com/package/@racehooks/mcp)
- [Smithery listing](https://smithery.ai/server/racehooks-mcp)
- [MCP specification](https://modelcontextprotocol.io)
