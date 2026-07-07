import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RaceHooks } from "racehooks";

const WebhookFiltersSchema = z.object({
  drivers:       z.array(z.string()).optional().describe('TLA codes, e.g. ["VER","NOR"]'),
  constructors:  z.array(z.string()).optional().describe('Team keywords, e.g. ["ferrari","mclaren"]'),
  positions:     z.object({ min: z.number().int().min(1).max(20).optional(), max: z.number().int().min(1).max(20).optional() }).optional(),
}).optional();

export function registerWebhookTools(server: McpServer, rh: RaceHooks): void {

  server.tool(
    "list_webhooks",
    "List all webhook subscriptions for the authenticated RaceHooks account.",
    { limit: z.number().int().min(1).max(100).default(20).optional(), offset: z.number().int().min(0).default(0).optional() },
    async ({ limit = 20, offset = 0 }) => {
      const result = await rh.webhooks.list({ limit, offset });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_webhook",
    "Get a single webhook subscription by ID.",
    { webhookId: z.string().min(1) },
    async ({ webhookId }) => {
      const result = await rh.webhooks.get(webhookId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "create_webhook",
    "Register a new webhook subscription. Returns the webhook and the HMAC signing secret (shown once — store it immediately).",
    {
      feedId:        z.string().min(1).describe("Feed ID from list_feeds. Use 'events.race' for structured race events."),
      webhookUrl:    z.string().url().describe("Public HTTPS URL to deliver payloads to."),
      webhookMethod: z.enum(["post", "put"]).default("post").optional(),
      filters:       WebhookFiltersSchema,
    },
    async ({ feedId, webhookUrl, webhookMethod = "post", filters }) => {
      const result = await rh.webhooks.create({ feedId, webhookUrl, webhookMethod, filters });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "update_webhook",
    "Update an existing webhook subscription. Use active: false to pause delivery, active: true to resume. " +
    "Can also update the endpoint URL, HTTP method, or filters without deleting and recreating the webhook.",
    {
      webhookId:     z.string().min(1),
      webhookUrl:    z.string().url().optional().describe("New endpoint URL."),
      webhookMethod: z.enum(["post", "put"]).optional(),
      filters:       WebhookFiltersSchema,
      active:        z.boolean().optional().describe("false = pause delivery, true = resume."),
    },
    async ({ webhookId, ...patch }) => {
      const result = await rh.webhooks.update(webhookId, patch);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_webhook",
    "Permanently delete a webhook subscription.",
    { webhookId: z.string().min(1) },
    async ({ webhookId }) => {
      await rh.webhooks.delete(webhookId);
      return { content: [{ type: "text", text: `Webhook ${webhookId} deleted.` }] };
    }
  );

  server.tool(
    "test_webhook",
    "Send a test payload to a webhook endpoint immediately. Useful for verifying your server is reachable and your HMAC verification code is correct.",
    { webhookId: z.string().min(1) },
    async ({ webhookId }) => {
      const result = await rh.webhooks.test(webhookId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_webhook_logs",
    "Retrieve recent delivery logs for a webhook — shows status codes, retry counts, and payload excerpts.",
    {
      webhookId: z.string().min(1),
      limit:     z.number().int().min(1).max(200).default(50).optional(),
    },
    async ({ webhookId, limit = 50 }) => {
      const result = await rh.webhooks.logs(webhookId, { limit });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_webhook_secret",
    "Retrieve the current HMAC signing secret for a webhook.",
    { webhookId: z.string().min(1) },
    async ({ webhookId }) => {
      const secret = await rh.webhooks.getSecret(webhookId);
      return { content: [{ type: "text", text: JSON.stringify({ webhookId, webhookSecret: secret }, null, 2) }] };
    }
  );

  server.tool(
    "rotate_webhook_secret",
    "Rotate the HMAC signing secret for a webhook. The old secret is invalidated immediately — update your server before calling this. The new secret is shown once.",
    { webhookId: z.string().min(1) },
    async ({ webhookId }) => {
      const result = await rh.webhooks.rotateSecret(webhookId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
