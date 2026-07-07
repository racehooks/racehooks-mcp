import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerFeedTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "list_feeds",
    "List all available RaceHooks data feeds, including which subscription tier each feed requires. " +
    "The special 'events.race' feed is a synthetic feed that emits structured events (overtakes, pit stops, safety cars, etc.) derived from multiple raw feeds.",
    { limit: z.number().int().min(1).max(100).default(50).optional() },
    async ({ limit = 50 }) => {
      const result = await rh.feeds.list({ limit });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
