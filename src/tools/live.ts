import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerLiveTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "get_live_session",
    "Get the current live F1 session state: flag status, lap number, driver positions, intervals, tyre compounds, and recent race control messages. Returns an empty/inactive context when no session is live.",
    {},
    async () => {
      const result = await rh.live.context();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "list_events",
    "List F1 events (race weekends) for the current or a specific season, including session schedules and status.",
    {
      limit:    z.number().int().min(1).max(50).default(30).optional(),
      year:     z.number().int().optional().describe("Season year, e.g. 2026. Defaults to current season."),
      upcoming: z.boolean().optional().describe("true = only return events that haven't started yet"),
    },
    async ({ limit = 30, year, upcoming }) => {
      const result = await rh.events.list({ limit, year, upcoming });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
