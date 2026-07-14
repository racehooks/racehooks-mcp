import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerDataTools(server: McpServer, rh: RaceHooks): void {

  // ── Drivers ────────────────────────────────────────────────────────────────

  server.tool(
    "list_drivers",
    "List F1 drivers. No authentication required — public data. Paid accounts receive larger page sizes.",
    {
      limit:       z.number().int().min(1).max(100).default(20).optional(),
      offset:      z.number().int().min(0).default(0).optional(),
      search:      z.string().optional().describe("Partial surname or forename match."),
      nationality: z.string().optional().describe("Filter by nationality, e.g. 'British'."),
      active:      z.boolean().optional().describe("true = currently racing, false = retired."),
    },
    async (opts) => {
      const result = await rh.data.listDrivers(opts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_driver",
    "Get a driver profile with career statistics (wins, podiums, poles, championships). No authentication required.",
    { driverId: z.string().min(1).describe("Driver slug, e.g. 'max_verstappen'.") },
    async ({ driverId }) => {
      const result = await rh.data.getDriver(driverId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_driver_results",
    "Get race-by-race results for a driver. Timing fields (gap, finish time) are only returned for Developer and Custom accounts.",
    {
      driverId: z.string().min(1),
      season:   z.number().int().optional().describe("Filter to a specific season year, e.g. 2026."),
      limit:    z.number().int().min(1).max(100).default(20).optional(),
      offset:   z.number().int().min(0).default(0).optional(),
    },
    async ({ driverId, ...opts }) => {
      const result = await rh.data.getDriverResults(driverId, opts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_driver_standings",
    "Get championship standings history for a driver across seasons.",
    {
      driverId: z.string().min(1),
      season:   z.number().int().optional().describe("Filter to a specific season year."),
    },
    async ({ driverId, season }) => {
      const result = await rh.data.getDriverStandings(driverId, { season });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Constructors ───────────────────────────────────────────────────────────

  server.tool(
    "list_constructors",
    "List F1 constructors. No authentication required.",
    {
      limit:   z.number().int().min(1).max(100).default(20).optional(),
      offset:  z.number().int().min(0).default(0).optional(),
      lineage: z.string().optional().describe("Filter by lineage slug, e.g. 'enstone'."),
      active:  z.boolean().optional(),
    },
    async (opts) => {
      const result = await rh.data.listConstructors(opts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_constructor",
    "Get a constructor profile including its lineage history (predecessor and successor teams). No authentication required.",
    { constructorId: z.string().min(1).describe("Constructor slug, e.g. 'red_bull'.") },
    async ({ constructorId }) => {
      const result = await rh.data.getConstructor(constructorId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_constructor_results",
    "Get race-by-race results for a constructor.",
    {
      constructorId: z.string().min(1),
      season:        z.number().int().optional(),
      limit:         z.number().int().min(1).max(100).default(20).optional(),
      offset:        z.number().int().min(0).default(0).optional(),
    },
    async ({ constructorId, ...opts }) => {
      const result = await rh.data.getConstructorResults(constructorId, opts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_constructor_standings",
    "Get championship standings history for a constructor across seasons.",
    {
      constructorId: z.string().min(1),
      season:        z.number().int().optional(),
    },
    async ({ constructorId, season }) => {
      const result = await rh.data.getConstructorStandings(constructorId, { season });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Circuits ───────────────────────────────────────────────────────────────

  server.tool(
    "list_circuits",
    "List all F1 circuits with location and coordinates. No authentication required.",
    {
      limit:   z.number().int().min(1).max(100).default(50).optional(),
      offset:  z.number().int().min(0).default(0).optional(),
      country: z.string().optional(),
    },
    async (opts) => {
      const result = await rh.data.listCircuits(opts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_circuit",
    "Get circuit details and analytics (compound priors, historical pace data). No authentication required.",
    { circuitId: z.string().min(1).describe("Circuit slug, e.g. 'monaco'.") },
    async ({ circuitId }) => {
      const result = await rh.data.getCircuit(circuitId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Seasons ────────────────────────────────────────────────────────────────

  server.tool(
    "list_seasons",
    "List all available F1 seasons with race counts. No authentication required.",
    {},
    async () => {
      const result = await rh.data.listSeasons();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_season_standings",
    "Get final driver and constructor championship standings for a season. No authentication required.",
    { year: z.number().int().describe("Season year, e.g. 2025.") },
    async ({ year }) => {
      const result = await rh.data.getSeasonStandings(year);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_season_races",
    "List all races in a season with circuit, date, and data quality tier. No authentication required.",
    { year: z.number().int() },
    async ({ year }) => {
      const result = await rh.data.getSeasonRaces(year);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Races ──────────────────────────────────────────────────────────────────

  server.tool(
    "get_race",
    "Get race details with full results and qualifying grid. Timing fields require Developer or Custom. No authentication required for basic data.",
    { raceId: z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'.") },
    async ({ raceId }) => {
      const result = await rh.data.getRace(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_qualifying",
    "Get qualifying results for a race (Q1/Q2/Q3 times). No authentication required.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceQualifying(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_pitstops",
    "Get all pit stop records for a race (driver, stop number, lap, duration). No authentication required.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRacePitstops(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_tyres",
    "Get tyre stint records for a race (driver, stint number, lap range, compound, tyre age). No authentication required.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceTyres(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_weather",
    "Get lap-by-lap weather data for a race. No authentication required.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceWeather(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_laps",
    "Get per-lap times and positions for a race. Requires Developer or Custom. " +
    "Optionally filter to a single driver with driverId.",
    {
      raceId:   z.string().min(1),
      driverId: z.string().optional().describe("Filter to a specific driver, e.g. 'max_verstappen'."),
    },
    async ({ raceId, driverId }) => {
      const result = await rh.data.getRaceLaps(raceId, { driverId });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_summary",
    "Get the post-race analytics pipeline status and aggregate metrics for a race.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceSummary(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_telemetry_laps",
    "Get per-lap telemetry metrics (speed, throttle, brake, DRS, aggression) from telemetry data. Requires Developer. " +
    "Optional driverId to filter to one driver.",
    {
      raceId:   z.string().min(1),
      driverId: z.string().optional(),
    },
    async ({ raceId, driverId }) => {
      const result = await rh.data.getRaceTelemetryLaps(raceId, { driverId });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_telemetry_stints",
    "Get per-stint telemetry metrics and degradation slopes. Requires Custom.",
    {
      raceId:   z.string().min(1),
      driverId: z.string().optional(),
    },
    async ({ raceId, driverId }) => {
      const result = await rh.data.getRaceTelemetryStints(raceId, { driverId });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_telemetry_aggression",
    "Get driver aggression index rankings for a race. Requires Custom.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceTelemetryAggression(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_session_analytics",
    "Get per-lap ML analytics snapshot for a session (pit probability, SC probability, tyre health, LTOE, win probability). Requires Custom.",
    { sessionId: z.string().min(1).describe("Session ID, e.g. '2026-bahrain_r'.") },
    async ({ sessionId }) => {
      const result = await rh.data.getSessionAnalytics(sessionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_event_pace",
    "Get practice and qualifying pace summary per driver for an event. Requires Developer.",
    { eventId: z.string().min(1).describe("Event ID from list_events.") },
    async ({ eventId }) => {
      const result = await rh.data.getEventPace(eventId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
