import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaceHooks } from "racehooks";
import { RaceHooksAPIError, RaceHooksAuthError } from "racehooks";
import { errorResult, safe } from "../helpers.js";
import { registerWebhookTools } from "../tools/webhooks.js";
import { registerFeedTools } from "../tools/feeds.js";
import { registerLiveTools } from "../tools/live.js";
import { registerUsageTools } from "../tools/usage.js";
import { registerSimulateTools } from "../tools/simulate.js";
import { registerDataTools } from "../tools/data.js";
import { registerInsightTools } from "../tools/insights.js";
import { registerTelemetryTools } from "../tools/telemetry.js";
import { registerFantasyTools } from "../tools/fantasy.js";

describe("tool annotations", () => {
  it("every registered tool has title and all four hints", () => {
    const server = new McpServer({ name: "racehooks", version: "test" }, { capabilities: { tools: {} } });
    const seen: Record<string, any> = {};
    const orig = server.registerTool.bind(server) as (...a: any[]) => unknown;
    (server as any).registerTool = (name: string, cfg: any, cb: unknown) => {
      seen[name] = cfg;
      return orig(name, cfg, cb);
    };
    const rh = {} as RaceHooks;
    for (const r of [registerFeedTools, registerWebhookTools, registerLiveTools, registerUsageTools,
      registerSimulateTools, registerDataTools, registerInsightTools, registerTelemetryTools, registerFantasyTools]) {
      r(server, rh);
    }
    const names = Object.keys(seen);
    expect(names.length).toBeGreaterThanOrEqual(58);
    for (const n of names) {
      const a = seen[n].annotations;
      expect(typeof a.title).toBe("string");
      expect(a.title.length).toBeGreaterThan(0);
      for (const k of ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"]) {
        expect(typeof a[k]).toBe("boolean");
      }
      expect(a.openWorldHint).toBe(true);
    }
    expect(seen.delete_webhook.annotations.destructiveHint).toBe(true);
    expect(seen.create_webhook.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: false });
    expect(seen.list_feeds.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
  });
});

describe("error helper", () => {
  it("maps 401 to isError with the credentials hint", () => {
    const r = errorResult(new RaceHooksAPIError("Unauthorized", 401, ""), "list_feeds");
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toContain("RACEHOOKS_CLIENT_ID");
    expect(r.content[0].text).toContain("plan");
  });
  it("maps auth errors, 404 and 429", () => {
    expect(errorResult(new RaceHooksAuthError("bad")).content[0].text).toContain("RACEHOOKS_CLIENT_SECRET");
    expect(errorResult(new RaceHooksAPIError("nope", 404, ""), "get_webhook").content[0].text).toContain("list_webhooks");
    expect(errorResult(new RaceHooksAPIError("slow", 429, "")).content[0].text).toContain("Retry later");
    expect(errorResult(new RaceHooksAPIError("boom", 500, "")).content[0].text).toContain("boom");
  });
  it("safe() converts thrown errors into tool results", async () => {
    const r = await safe("x", async () => { throw new RaceHooksAPIError("Forbidden", 403, ""); })();
    expect(r.isError).toBe(true);
  });
});
