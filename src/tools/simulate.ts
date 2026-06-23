import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

export function registerSimulateTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "start_simulation",
    "Replay a historical F1 session against your registered webhooks. " +
    "Historical session data is delivered to your active webhook endpoints at the chosen speed. " +
    "Use this to develop and test your integration without waiting for a live race.",
    {
      sessionId: z.string().min(1).describe("Session ID from list_events (e.g. a qualifying or race session ID)."),
      speed:     z.union([z.number().int().min(1).max(100), z.literal("instant")]).default(1).optional()
                   .describe("Playback speed multiplier (1 = real-time, 10 = 10× speed, 'instant' = as fast as possible)."),
      feeds:     z.array(z.string()).optional().describe("Limit playback to specific feed IDs. Omit to replay all subscribed feeds."),
    },
    async ({ sessionId, speed = 1, feeds }) => {
      const result = await rh.simulate.start({ sessionId, speed, feeds });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "list_simulations",
    "List all simulations (running and completed) for this account.",
    {},
    async () => {
      const result = await rh.simulate.list();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_simulation",
    "Get the status and log of a specific simulation, including events dispatched, deliveries made, and error count.",
    { simulationId: z.string().min(1) },
    async ({ simulationId }) => {
      const result = await rh.simulate.get(simulationId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "pause_simulation",
    "Pause a running simulation. Resume it with resume_simulation.",
    { simulationId: z.string().min(1) },
    async ({ simulationId }) => {
      const result = await rh.simulate.pause(simulationId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "resume_simulation",
    "Resume a paused simulation.",
    { simulationId: z.string().min(1) },
    async ({ simulationId }) => {
      const result = await rh.simulate.resume(simulationId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "cancel_simulation",
    "Cancel a running or paused simulation.",
    { simulationId: z.string().min(1) },
    async ({ simulationId }) => {
      await rh.simulate.cancel(simulationId);
      return { content: [{ type: "text", text: `Simulation ${simulationId} cancelled.` }] };
    }
  );
}
