/**
 * Tool-wiring smoke test.
 *
 * The MCP server delegates all API work to the racehooks Node SDK (see
 * mcp_upgrade.md); this verifies every namespace registrar wires its tools onto
 * the server without error and without duplicate tool names. Handlers are not
 * invoked here — the SDK has its own tests — so a stub client is sufficient.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaceHooks } from "racehooks";
import { registerWebhookTools } from "../tools/webhooks.js";
import { registerFeedTools } from "../tools/feeds.js";
import { registerLiveTools } from "../tools/live.js";
import { registerUsageTools } from "../tools/usage.js";
import { registerSimulateTools } from "../tools/simulate.js";
import { registerDataTools } from "../tools/data.js";
import { registerInsightTools } from "../tools/insights.js";
import { registerTelemetryTools } from "../tools/telemetry.js";
import { registerFantasyTools } from "../tools/fantasy.js";

describe("MCP tool wiring", () => {
  it("every registrar registers tools with no duplicate names", () => {
    const server = new McpServer(
      { name: "racehooks", version: "test" },
      { capabilities: { tools: {} } },
    );

    const registered: string[] = [];
    const origTool = server.tool.bind(server) as (...a: unknown[]) => unknown;
    // Record each registered tool name, then delegate to the real implementation
    // so duplicate-name registration still throws (a real wiring bug).
    (server as unknown as { tool: (...a: unknown[]) => unknown }).tool = (
      ...args: unknown[]
    ) => {
      registered.push(args[0] as string);
      return origTool(...args);
    };

    const rh = {} as RaceHooks;
    const registrars = [
      registerFeedTools,
      registerWebhookTools,
      registerLiveTools,
      registerUsageTools,
      registerSimulateTools,
      registerDataTools,
      registerInsightTools,
      registerTelemetryTools,
      registerFantasyTools,
    ];
    for (const register of registrars) register(server, rh);

    // A representative tool from the core namespace is present.
    expect(registered).toContain("list_feeds");
    // The full SDK-backed surface registers a substantial tool set.
    expect(registered.length).toBeGreaterThanOrEqual(17);
    // No two tools share a name.
    expect(new Set(registered).size).toBe(registered.length);
  });
});
