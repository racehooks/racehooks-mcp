import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerFantasyTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "get_fantasy_pit_times",
    "Get the pit lane time leaderboard for a session. Data is sourced from the live in-memory tracker during active sessions — returns empty for completed sessions. Requires Bearer authentication.",
    { sessionId: z.string().min(1).describe("Session ID, e.g. '2026-bahrain_r'.") },
    async ({ sessionId }) => {
      const result = await rh.fantasy.getSessionPitTimes(sessionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_fantasy_scores",
    "Get estimated F1 Fantasy points per driver for a completed race. " +
    "Includes full scoring breakdown: race position points, qualifying points, Q2/Q3 bonuses, positions gained, fastest lap, beat-teammate bonuses, and DNF penalty. Requires Bearer authentication.",
    { raceId: z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'.") },
    async ({ raceId }) => {
      const result = await rh.fantasy.getRaceScores(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
