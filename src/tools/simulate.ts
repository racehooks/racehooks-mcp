import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

// The racehooks SDK has no methods for the /v1/simulate replay endpoints yet, so these
// tools make authenticated calls through the SDK's own HTTP client (OAuth refresh included).
interface Http {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
}
const httpOf = (rh: RaceHooks): Http => (rh as unknown as { http: Http }).http;
const json = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] });

export function registerSimulateTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "list_replay_sessions",
    "List recorded F1 sessions that have archived data and can be replayed. Only completed sessions with archive paths are returned. " +
    "Self-serve tiers (Free and Developer) list the current season only, plus the curated demo session; the full historical archive is on Custom. " +
    "`restrictedToSeason` in the response reports the applied limit.",
    {
      year:   z.string().regex(/^\d{4}$/).optional().describe("Calendar year, e.g. '2026'."),
      type:   z.enum(["race", "qualifying", "sprint", "practice"]).optional().describe("Session type."),
      limit:  z.number().int().min(1).max(500).optional().describe("Max results (default 200)."),
      offset: z.number().int().min(0).optional().describe("Results to skip (default 0)."),
    },
    async ({ year, type, limit, offset }) => {
      const qs = new URLSearchParams();
      if (year !== undefined) qs.set("year", year);
      if (type !== undefined) qs.set("type", type);
      if (limit !== undefined) qs.set("limit", String(limit));
      if (offset !== undefined) qs.set("offset", String(offset));
      const q = qs.toString();
      return json(await httpOf(rh).get(`/v1/simulate/sessions${q ? `?${q}` : ""}`));
    }
  );

  server.tool(
    "get_demo_session",
    "Get the curated demo session to replay (the canonical ID of a guaranteed-real event).",
    {},
    async () => json(await httpOf(rh).get("/v1/simulate/demo"))
  );

  server.tool(
    "get_replay_quota",
    "Get the replay delivery quota for this account: distinct-session lifetime slots for your tier.",
    {},
    async () => json(await httpOf(rh).get("/v1/simulate/quota"))
  );

  server.tool(
    "prepare_replay",
    "Prepare a session for recorded playback, generating its playback artifact if not already cached. " +
    "Check readiness with get_replay_status.",
    { sessionId: z.string().min(1).describe("Session ID from list_replay_sessions or get_demo_session.") },
    async ({ sessionId }) => json(await httpOf(rh).post("/v1/simulate/prepare", { sessionId }))
  );

  server.tool(
    "get_replay_status",
    "Check whether a session's playback artifact is ready to stream.",
    { sessionId: z.string().min(1).describe("Session ID from list_replay_sessions or get_demo_session.") },
    async ({ sessionId }) =>
      json(await httpOf(rh).get(`/v1/simulate/status?session=${encodeURIComponent(sessionId)}`))
  );
}
