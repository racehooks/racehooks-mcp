import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RaceHooks } from "racehooks";

export function registerUsageTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "get_subscription",
    "Get the current subscription tier, plan limits (webhooks, deliveries, HMAC, analytics enrichment), and live usage snapshot for this account.",
    {},
    async () => {
      const result = await rh.usage.subscription();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_usage",
    "Get delivery usage summary for the current period: total deliveries, failures, tier, and remaining monthly delivery bucket.",
    {},
    async () => {
      const result = await rh.usage.current();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_usage_by_feed",
    "Get webhook delivery counts broken down by feed for today. Useful for identifying which feeds are driving delivery volume.",
    {},
    async () => {
      const result = await rh.usage.byFeed();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_usage_latency",
    "Get webhook delivery latency percentiles (p50, p95, p99) broken down by feed for the current period.",
    {},
    async () => {
      const result = await rh.usage.latency();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_usage_hourly",
    "Get webhook delivery volume broken down by hour for the current period. Useful for identifying traffic spikes.",
    {},
    async () => {
      const result = await rh.usage.hourly();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_usage_history",
    "Get historical delivery counts and failure rates over past periods.",
    {},
    async () => {
      const result = await rh.usage.history();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_billing_plan",
    "Get the detailed billing plan including tier, subscription period end date, limits, and current usage. Use this to check whether Analytics enrichment is active.",
    {},
    async () => {
      const result = await rh.usage.billingPlan();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
