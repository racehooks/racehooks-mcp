import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";
import { RaceHooksAPIError, RaceHooksAuthError } from "racehooks";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
  [k: string]: unknown;
};

const WRITE_TOOLS = new Set([
  "create_webhook",
  "update_webhook",
  "delete_webhook",
  "test_webhook",
  "rotate_webhook_secret",
  "prepare_replay",
]);
const DESTRUCTIVE_TOOLS = new Set(["delete_webhook", "rotate_webhook_secret"]);
// Writes that are safe to repeat with the same arguments.
const IDEMPOTENT_WRITES = new Set(["update_webhook", "delete_webhook", "prepare_replay"]);

export function titleFor(name: string): string {
  return name
    .split("_")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function annotationsFor(name: string) {
  const write = WRITE_TOOLS.has(name) || /^(create|update|delete)_/.test(name);
  return {
    title: titleFor(name),
    readOnlyHint: !write,
    destructiveHint: DESTRUCTIVE_TOOLS.has(name) || name.startsWith("delete_"),
    idempotentHint: write ? IDEMPOTENT_WRITES.has(name) : true,
    openWorldHint: true,
  };
}

function listHint(name: string): string {
  if (name.includes("webhook")) return " Use list_webhooks to see valid webhook IDs.";
  if (name.includes("driver")) return " Use list_drivers to find valid driver IDs.";
  if (name.includes("constructor")) return " Use list_constructors to find valid constructor IDs.";
  if (name.includes("circuit")) return " Use list_circuits to find valid circuit IDs.";
  if (name.includes("replay") || name.includes("session"))
    return " Use list_replay_sessions to find valid session IDs.";
  if (name.includes("race") || name.includes("season"))
    return " Use get_season_races to find valid race IDs.";
  return "";
}

export function errorResult(err: unknown, toolName = ""): ToolResult {
  let text: string;
  const status = err instanceof RaceHooksAPIError ? err.statusCode : undefined;
  const message = err instanceof Error ? err.message : String(err);
  if (err instanceof RaceHooksAuthError || status === 401 || status === 403) {
    text =
      `Authentication or authorization failed (${message}). Check that RACEHOOKS_CLIENT_ID and ` +
      `RACEHOOKS_CLIENT_SECRET are correct, and that your plan includes this feed or endpoint.`;
  } else if (status === 404) {
    text = `Not found: the requested id or resource was not found (${message}).${listHint(toolName)}`;
  } else if (status === 429) {
    text = `Rate limited by the RaceHooks API. Retry later (${message}).`;
  } else {
    text = `RaceHooks API error${status ? ` (${status})` : ""}: ${message}`;
  }
  return { isError: true, content: [{ type: "text", text }] };
}

/** Wrap a handler so thrown errors become MCP tool errors with a helpful message. */
export function safe<A extends unknown[]>(
  name: string,
  cb: (...args: A) => Promise<ToolResult> | ToolResult,
): (...args: A) => Promise<ToolResult> {
  return async (...args: A) => {
    try {
      return await cb(...args);
    } catch (err) {
      return errorResult(err, name);
    }
  };
}

/** Register a tool with annotations and shared error handling. */
export function tool<S extends ZodRawShape>(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: S,
  cb: (args: any) => Promise<ToolResult> | ToolResult,
): void {
  server.registerTool(
    name,
    { title: titleFor(name), description, inputSchema, annotations: annotationsFor(name) },
    safe(name, cb) as any,
  );
}
