import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RaceHooks } from "racehooks";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerFeedTools } from "./tools/feeds.js";
import { registerLiveTools } from "./tools/live.js";
import { registerUsageTools } from "./tools/usage.js";
import { registerSimulateTools } from "./tools/simulate.js";
import { registerDataTools } from "./tools/data.js";
import { registerInsightTools } from "./tools/insights.js";
import { registerTelemetryTools } from "./tools/telemetry.js";
import { registerFantasyTools } from "./tools/fantasy.js";

// Per MCP best practice: never write to stdout in a stdio server.
// All diagnostic output must go to stderr.

const VERSION = "0.2.0";

async function main(): Promise<void> {
  const clientId     = process.env.RACEHOOKS_CLIENT_ID;
  const clientSecret = process.env.RACEHOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(
      "[racehooks-mcp] Set RACEHOOKS_CLIENT_ID and RACEHOOKS_CLIENT_SECRET before starting."
    );
    process.exit(1);
  }

  const rh = new RaceHooks({
    clientId,
    clientSecret,
    baseUrl: (process.env.RACEHOOKS_BASE_URL ?? "https://api.racehooks.io").replace(/\/$/, ""),
  });

  const server = new McpServer(
    { name: "racehooks", version: VERSION },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  // ── Tools ──────────────────────────────────────────────────────────────────
  registerFeedTools(server, rh);
  registerWebhookTools(server, rh);
  registerLiveTools(server, rh);
  registerUsageTools(server, rh);
  registerSimulateTools(server, rh);
  registerDataTools(server, rh);
  registerInsightTools(server, rh);
  registerTelemetryTools(server, rh);
  registerFantasyTools(server, rh);

  // ── Resources ─────────────────────────────────────────────────────────────

  server.resource(
    "feed-catalog",
    "racehooks://feeds",
    { description: "Complete RaceHooks feed catalog — all subscribable feeds with tier requirements and cadence information." },
    async () => {
      const result = await rh.feeds.list({ limit: 50 });
      return {
        contents: [{ uri: "racehooks://feeds", mimeType: "application/json", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.resource(
    "live-session",
    "racehooks://live",
    { description: "Current live F1 session context: flag status, lap counter, full driver standings with tyre compounds and intervals, and recent race control messages." },
    async () => {
      const result = await rh.live.context();
      return {
        contents: [{ uri: "racehooks://live", mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.resource(
    "webhooks",
    "racehooks://webhooks",
    { description: "All active webhook subscriptions on this account, including feed IDs, endpoint URLs, filter configurations, and delivery tier." },
    async () => {
      const result = await rh.webhooks.list({ limit: 100 });
      return {
        contents: [{ uri: "racehooks://webhooks", mimeType: "application/json", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.resource(
    "usage",
    "racehooks://usage",
    { description: "Current delivery usage: total deliveries today, failure count, daily limit, and remaining capacity." },
    async () => {
      const result = await rh.usage.current();
      return {
        contents: [{ uri: "racehooks://usage", mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.resource(
    "drivers",
    "racehooks://drivers",
    { description: "Current-season F1 driver roster with car numbers and TLA codes." },
    async () => {
      const result = await rh.data.listDrivers({ active: true, limit: 25 });
      return {
        contents: [{ uri: "racehooks://drivers", mimeType: "application/json", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.resource(
    "circuits",
    "racehooks://circuits",
    { description: "All F1 circuits in the RaceHooks database with location and country." },
    async () => {
      const result = await rh.data.listCircuits({ limit: 100 });
      return {
        contents: [{ uri: "racehooks://circuits", mimeType: "application/json", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.resource(
    "seasons",
    "racehooks://seasons",
    { description: "All available F1 seasons in the RaceHooks database with race counts." },
    async () => {
      const result = await rh.data.listSeasons();
      return {
        contents: [{ uri: "racehooks://seasons", mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Prompts ────────────────────────────────────────────────────────────────

  server.prompt(
    "setup_race_event_webhook",
    "Guided workflow: create a raceevent webhook subscription with optional driver, constructor, or position filters.",
    {
      webhookUrl:   z.string().url().describe("Your public HTTPS endpoint URL."),
      drivers:      z.string().optional().describe("Comma-separated TLA codes to filter, e.g. 'VER,NOR'. Leave blank for all."),
      constructors: z.string().optional().describe("Comma-separated team keywords to filter, e.g. 'ferrari,mclaren'. Leave blank for all."),
      posMin:       z.string().optional().describe("Minimum race position (inclusive). Leave blank for no limit."),
      posMax:       z.string().optional().describe("Maximum race position (inclusive). Leave blank for no limit."),
    },
    ({ webhookUrl, drivers, constructors, posMin, posMax }) => {
      const filters: Record<string, unknown> = {};
      if (drivers) filters.drivers = drivers.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
      if (constructors) filters.constructors = constructors.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const mn = posMin ? parseInt(posMin, 10) : undefined;
      const mx = posMax ? parseInt(posMax, 10) : undefined;
      if (mn !== undefined || mx !== undefined) {
        filters.positions = { ...(mn !== undefined && { min: mn }), ...(mx !== undefined && { max: mx }) };
      }

      const filterSummary = Object.keys(filters).length
        ? `\n\nFilters that will be applied:\n${JSON.stringify(filters, null, 2)}`
        : "\n\nNo filters — all race events will be delivered.";

      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `Please create a raceevent webhook subscription for me.\n\n` +
                  `Endpoint URL: ${webhookUrl}${filterSummary}\n\n` +
                  `Use the create_webhook tool with feedId "raceevent", webhookUrl "${webhookUrl}", ` +
                  `and filters ${JSON.stringify(filters)}. ` +
                  `After creating it, call test_webhook to verify the endpoint is reachable. ` +
                  `Show me the webhookSecret and remind me to store it — it won't be shown again.`,
          },
        }],
      };
    }
  );

  server.prompt(
    "check_account_health",
    "Get a summary of account health: current tier, usage vs limits, active webhook count, and live session status.",
    {},
    () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Give me a health check on my RaceHooks account. " +
                "Call get_subscription, get_usage_by_feed, list_webhooks, and get_live_session in parallel, " +
                "then summarise: my current tier and limits, how much of my delivery budget I've used today (broken down by feed), " +
                "how many webhooks are active vs paused, and whether there is a live F1 session right now.",
        },
      }],
    })
  );

  server.prompt(
    "setup_fantasy_scoring_webhook",
    "Guided workflow: create a webhook optimised for F1 Fantasy scoring — overtakes, fastest lap, DNF, and pit stop events.",
    {
      webhookUrl: z.string().url().describe("Your scoring engine's HTTPS endpoint."),
      drivers:    z.string().optional().describe("Comma-separated TLA codes for the drivers on your fantasy team, e.g. 'VER,NOR,LEC'."),
    },
    ({ webhookUrl, drivers }) => {
      const driverList = drivers
        ? drivers.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
        : [];
      const filterNote = driverList.length
        ? `Only events involving ${driverList.join(", ")} will be delivered.`
        : "Events for all drivers will be delivered.";

      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `Set up a raceevent webhook for my F1 Fantasy scoring engine.\n\n` +
                  `Endpoint: ${webhookUrl}\n` +
                  `Driver filter: ${driverList.length ? driverList.join(", ") : "none"}\n\n` +
                  filterNote + "\n\n" +
                  `The raceevent feed emits: overtake (+1pt each), fastest.lap (+10pt), retirement (-20pt), ` +
                  `pit.entry and pit.exit (for fastest pit stop scoring), and session.start.\n\n` +
                  `Use create_webhook with feedId "raceevent", webhookUrl "${webhookUrl}", ` +
                  `and filters ${JSON.stringify(driverList.length ? { drivers: driverList } : {})}. ` +
                  `Then test the endpoint and show me the HMAC secret. ` +
                  `After the race, use get_fantasy_scores with the raceId to see the final points breakdown.`,
          },
        }],
      };
    }
  );

  server.prompt(
    "analyze_race_strategy",
    "Analyze pit strategy, tyre management, and ML predictions for a specific race — optionally focused on one driver.",
    {
      raceId:   z.string().describe("Race ID slug, e.g. '2026-bahrain-r1'. Use list_insight_races to find available races."),
      driverId: z.string().optional().describe("Focus on a specific driver, e.g. 'max_verstappen'. Leave blank for full-field analysis."),
    },
    ({ raceId, driverId }) => {
      const driverFocus = driverId ? ` Focus particularly on ${driverId}.` : "";
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `Analyze the race strategy for ${raceId}.\n\n` +
                  `Call these tools in parallel:\n` +
                  `- get_race_insights("${raceId}") — per-lap ML predictions\n` +
                  `- get_race_laps("${raceId}"${driverId ? `, driverId: "${driverId}"` : ""}) — lap time data\n` +
                  `- get_race_pitstops("${raceId}") — actual pit stops\n` +
                  `- get_race_tyres("${raceId}") — tyre stints\n\n` +
                  `Then analyze:\n` +
                  `1. When did the ML model flag high pit stop probability, and did the actual stop align?\n` +
                  `2. Where did tyre health cliffs appear — did teams respond before or after?\n` +
                  `3. Were there undercut opportunities the model identified that were or weren't taken?\n` +
                  `4. How did safety car probability evolve, and did any SC deployment affect strategy?\n` +
                  `5. Which driver had the best LTOE (lap time vs expectation) and when?${driverFocus}`,
          },
        }],
      };
    }
  );

  server.prompt(
    "compare_drivers",
    "Compare two drivers across a race: pace delta, tyre degradation, pit strategy, and ML-predicted performance.",
    {
      driver1: z.string().describe("First driver ID, e.g. 'max_verstappen'."),
      driver2: z.string().describe("Second driver ID, e.g. 'lando_norris'."),
      raceId:  z.string().describe("Race ID slug, e.g. '2026-bahrain-r1'."),
    },
    ({ driver1, driver2, raceId }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Compare ${driver1} vs ${driver2} in ${raceId}.\n\n` +
                `Call these in parallel:\n` +
                `- get_race_laps("${raceId}", driverId: "${driver1}")\n` +
                `- get_race_laps("${raceId}", driverId: "${driver2}")\n` +
                `- get_race_insights("${raceId}")\n` +
                `- get_race_tyres("${raceId}")\n\n` +
                `Then analyze:\n` +
                `1. Lap-by-lap pace delta — where did each driver gain or lose time?\n` +
                `2. Tyre degradation rate per stint — who managed their tyres better?\n` +
                `3. LTOE comparison — who was performing above or below their car's expected pace?\n` +
                `4. Win probability trajectory — at what point in the race did the likely winner become clear?\n` +
                `5. Strategy divergence — did they pit at different times and why?`,
        },
      }],
    })
  );

  server.prompt(
    "explain_ml_predictions",
    "Explain what the RaceHooks ML models predicted vs what actually happened in the most recent race with analytics data.",
    {},
    () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Explain the RaceHooks ML model predictions for the most recent race with analytics data.\n\n" +
                "First call list_insight_races() to find the most recent race, then call get_race_insights() " +
                "and get_model_meta() in parallel.\n\n" +
                "Then explain:\n" +
                "1. For each ML model (pit stop, safety car, tyre health, win probability): what did it predict, and what actually happened?\n" +
                "2. Where were the predictions most accurate, and where did they miss?\n" +
                "3. What were the model's current training metrics (PR-AUC, Brier score) and what do they mean?\n" +
                "4. Were there any key moments where a driver ignored a high pit probability signal, and did it cost them?",
        },
      }],
    })
  );

  // ── Transport ──────────────────────────────────────────────────────────────
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[racehooks-mcp] v${VERSION} running on stdio`);
}

main().catch(err => {
  console.error("[racehooks-mcp] Fatal:", err);
  process.exit(1);
});
