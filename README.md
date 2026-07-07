# racehooks-mcp

MCP server for [RaceHooks](https://racehooks.io) — gives AI assistants (Claude, Cursor, Windsurf) direct access to RaceHooks motorsport analytics and data.

[![npm](https://img.shields.io/npm/v/racehooks-mcp)](https://www.npmjs.com/package/racehooks-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> RaceHooks is an independent service and is not affiliated with or endorsed by Formula One Management or the FIA. "Formula 1," "F1," and related marks are trademarks of Formula One Licensing BV.

## What this does

Exposes your [RaceHooks](https://racehooks.io) account as a set of tools and resources an AI assistant can call:

**Tools (actions):**
- `list_feeds` / `list_webhooks` / `get_webhook` / `create_webhook` / `delete_webhook`
- `test_webhook` / `get_webhook_logs`
- `get_live_session` / `list_events`
- `get_subscription` / `get_usage` / `get_usage_by_feed` / `get_billing_plan`
- `start_simulation` / `list_simulations` / `get_simulation` / `cancel_simulation`

**Resources (read-only context):**
- `racehooks://feeds` — full [feed catalog](https://racehooks.io/docs/feeds)
- `racehooks://live` — current live session state
- `racehooks://webhooks` — all webhook subscriptions
- `racehooks://usage` — current delivery usage

**Prompts (guided workflows):**
- `setup_race_event_webhook` — create a events.race subscription with filters
- `setup_fantasy_scoring_webhook` — create a fantasy-optimised subscription
- `check_account_health` — full account health summary

## Installation

```bash
npm install -g racehooks-mcp
```

Or run directly with npx:

```bash
npx racehooks-mcp
```

Get your API credentials at [racehooks.io](https://racehooks.io).

## Configuration

Set two environment variables before starting:

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
      "args": ["-y", "racehooks-mcp"],
      "env": {
        "RACEHOOKS_CLIENT_ID": "your-client-id",
        "RACEHOOKS_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Claude Code (project config)

Add to `.claude/settings.json` in your project:

```json
{
  "mcpServers": {
    "racehooks": {
      "type": "stdio",
      "command": "racehooks-mcp",
      "env": {
        "RACEHOOKS_CLIENT_ID": "your-client-id",
        "RACEHOOKS_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Or with npx (no global install needed):

```json
{
  "mcpServers": {
    "racehooks": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "racehooks-mcp"],
      "env": {
        "RACEHOOKS_CLIENT_ID": "your-client-id",
        "RACEHOOKS_CLIENT_SECRET": "your-client-secret"
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
      "args": ["-y", "racehooks-mcp"],
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

> "Create a events.race webhook for https://myapp.com/hook, filtering for Ferrari only"

> "Start a simulation of the 2025 Monaco GP qualifying against my webhooks at 10× speed"

> "Show me which feeds are using the most delivery quota today"

> "Set up a fantasy scoring webhook for my VER, NOR, LEC team at https://scoring.myapp.com/hook"

## Security

The MCP server runs as a local stdio process — it never binds a network port. Your credentials are passed via environment variables, not included in tool calls or resource URIs.

All API calls are authenticated using OAuth 2 client credentials (token auto-refreshes before expiry).

## Links

- [RaceHooks console](https://racehooks.io/console) — sign up and manage your account
- [RaceHooks API documentation](https://racehooks.io/docs)
- [Webhook API reference](https://racehooks.io/docs/webhooks)
- [Feed catalog](https://racehooks.io/docs/feeds)
- [GitHub](https://github.com/racehooks/racehooks-mcp)
- [npm](https://www.npmjs.com/package/racehooks-mcp)
- [Smithery listing](https://smithery.ai/server/racehooks-mcp)
- [MCP specification](https://modelcontextprotocol.io)
