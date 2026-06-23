import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerTelemetryTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "get_telemetry_laps",
    "Get per-lap telemetry aggregates (avg/max speed, throttle, brake, DRS, aggression index). " +
    "Returns all drivers by default. Filter with driverId or lapNumber. Requires Bearer authentication.",
    {
      raceId:    z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'."),
      driverId:  z.string().optional().describe("Filter to a specific driver."),
      lapNumber: z.number().int().optional().describe("Filter to a specific lap number."),
    },
    async ({ raceId, driverId, lapNumber }) => {
      const result = await rh.telemetry.getRaceLaps(raceId, { driverId, lapNumber });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_telemetry_driver_laps",
    "Get per-lap telemetry for a single driver across all laps of a race. Requires Bearer authentication.",
    {
      raceId:   z.string().min(1),
      driverId: z.string().min(1),
    },
    async ({ raceId, driverId }) => {
      const result = await rh.telemetry.getDriverLaps(raceId, driverId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_telemetry_lap_comparison",
    "Get all drivers' telemetry for a single lap — useful for side-by-side lap comparisons. Requires Bearer authentication.",
    {
      raceId:    z.string().min(1),
      lapNumber: z.number().int().min(1),
    },
    async ({ raceId, lapNumber }) => {
      const result = await rh.telemetry.getLapComparison(raceId, lapNumber);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_telemetry_race_summary",
    "Get race-level telemetry summary: max speed, fastest driver, average throttle/brake percentages, top aggression driver. Requires Bearer authentication.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.telemetry.getRaceSummary(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
