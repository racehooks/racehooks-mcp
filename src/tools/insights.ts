import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerInsightTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "list_insight_races",
    "List F1 races that have a completed post-race analytics pipeline — i.e. races where get_race_insights will return data. Available on every plan.",
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
    "Output depends on plan: Free receives the descriptive data plus tyre state only (compound, tyre life, tyre health); " +
    "the strategic predictions require Developer or higher.",
    { raceId: z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'.") },
    async ({ raceId }) => {
      const result = await rh.insights.getRace(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_model_meta",
    "Get the public model manifest for each RaceHooks predictive model: what it predicts, its model family, " +
    "a qualitative calibration tier, when it was last trained, and a changelog. Raw evaluation metrics are not exposed. " +
    "Available on every plan.",
    {},
    async () => {
      const result = await rh.insights.getModelMeta();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
