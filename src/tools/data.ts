import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerDataTools(server: McpServer, rh: RaceHooks): void {

  // ── Drivers ────────────────────────────────────────────────────────────────

  server.tool(
    "list_drivers",
    "List F1 drivers. Available on every plan; page size is capped at 25 on Free and 100 on paid plans.",
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
    "Get a driver profile with career statistics (wins, podiums, poles, championships). Available on every plan.",
    { driverId: z.string().min(1).describe("Driver slug, e.g. 'max_verstappen'.") },
    async ({ driverId }) => {
      const result = await rh.data.getDriver(driverId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_driver_results",
    "Get race-by-race results for a driver. Available on every plan; timing fields (gap, finish time) are only returned on Developer and above.",
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
    "Get championship standings history for a driver across seasons. Available on every plan.",
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
    "List F1 constructors. Available on every plan.",
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
    "Get a constructor profile including its lineage history (predecessor and successor teams). Available on every plan.",
    { constructorId: z.string().min(1).describe("Constructor slug, e.g. 'red_bull'.") },
    async ({ constructorId }) => {
      const result = await rh.data.getConstructor(constructorId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_constructor_results",
    "Get race-by-race results for a constructor. Available on every plan; timing fields (gap, finish time) are only returned on Developer and above.",
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
    "Get championship standings history for a constructor across seasons. Available on every plan.",
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
    "List all F1 circuits with location and coordinates. Available on every plan.",
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
    "Get circuit details and analytics (compound priors, historical pace data). Available on every plan.",
    { circuitId: z.string().min(1).describe("Circuit slug, e.g. 'monaco'.") },
    async ({ circuitId }) => {
      const result = await rh.data.getCircuit(circuitId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Seasons ────────────────────────────────────────────────────────────────

  server.tool(
    "list_seasons",
    "List all available F1 seasons with race counts. Available on every plan.",
    {},
    async () => {
      const result = await rh.data.listSeasons();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_season_standings",
    "Get final driver and constructor championship standings for a season. Available on every plan.",
    { year: z.number().int().describe("Season year, e.g. 2025.") },
    async ({ year }) => {
      const result = await rh.data.getSeasonStandings(year);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_season_races",
    "List all races in a season with circuit, date, and data quality tier. Available on every plan.",
    { year: z.number().int() },
    async ({ year }) => {
      const result = await rh.data.getSeasonRaces(year);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Races ──────────────────────────────────────────────────────────────────

  server.tool(
    "get_race",
    "Get race details with full results and qualifying grid. Available on every plan; timing fields (gaps, fastest lap, finish time, Q1/Q2/Q3 times) are only returned on Developer and above.",
    { raceId: z.string().min(1).describe("Race ID slug, e.g. '2026-bahrain-r1'.") },
    async ({ raceId }) => {
      const result = await rh.data.getRace(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_qualifying",
    "Get qualifying results for a race. Available on every plan; Q1/Q2/Q3 times are only returned on Developer and above.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceQualifying(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_pitstops",
    "Get all pit stop records for a race (driver, stop number, lap, duration). Available on every plan.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRacePitstops(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_tyres",
    "Get tyre stint records for a race (driver, stint number, lap range, compound, tyre age). Available on every plan.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceTyres(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_weather",
    "Get lap-by-lap weather data for a race. Available on every plan.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceWeather(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_laps",
    "Get per-lap times and positions for a race. Requires Developer or higher. " +
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
    "Get the post-race analytics status and aggregate telemetry metrics for a race. Status is available on every plan; the aggregate metrics are only returned on Developer and above.",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceSummary(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_race_telemetry_laps",
    "Get per-lap telemetry metrics (speed, throttle, brake, DRS, aggression) from telemetry data. Requires Developer or higher. " +
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
    "Get per-stint telemetry metrics and degradation slopes. Requires a Custom plan (not included in Developer).",
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
    "Get driver aggression index rankings for a race. Requires a Custom plan (not included in Developer).",
    { raceId: z.string().min(1) },
    async ({ raceId }) => {
      const result = await rh.data.getRaceTelemetryAggression(raceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_session_analytics",
    "Get per-lap ML analytics snapshot for a session (pit probability, SC probability, tyre health, LTOE, win probability). Requires Developer or higher.",
    { sessionId: z.string().min(1).describe("Session ID, e.g. '2026-bahrain_r'.") },
    async ({ sessionId }) => {
      const result = await rh.data.getSessionAnalytics(sessionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_event_pace",
    "Get practice and qualifying pace summary per driver for an event. Requires Developer or higher.",
    { eventId: z.string().min(1).describe("Event ID from list_events.") },
    async ({ eventId }) => {
      const result = await rh.data.getEventPace(eventId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
