import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerInsightTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "list_insight_races",
    "List F1 races that have a completed post-race analytics pipeline — i.e. races where get_race_insights will return data. No authentication required.",
    {
      season: z.number().int().optional().describe("Filter to a specific season year."),
    },
    async ({ season }) => {
      const result = await rh.insights.listRaces({ season });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_insights",
    "Get the full post-race ML analytics bundle for a race. Includes per-driver per-lap outputs: " +
    "pit stop probability, safety car probability, overtake probability, undercut probability, " +
    "tyre health, cliff risk and lap prediction, fuel-corrected lap time (LTOE), win probability, " +
    "expected championship points. Also includes pit stops, tyre stints, lap times, and safety-car lap list. " +
    "No authentication required.",
    { raceId: z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'.") },
    async ({ raceId }) => {
      const result = await rh.insights.getRace(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_model_meta",
    "Get training metrics for each RaceHooks predictive model — pit stop, safety car, tyre health (LTOE), and win probability. " +
    "Returns PR-AUC, Brier score, ECE, F1-score, and threshold for the most recent training run per model. No authentication required.",
    {},
    async () => {
      const result = await rh.insights.getModelMeta();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
