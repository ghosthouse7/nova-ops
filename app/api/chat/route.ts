import { NextResponse } from "next/server";
import { TamboAI } from "@tambo-ai/typescript-sdk";

type ToolArgs = Record<string, unknown>;

type ToolCall = {
  id: string;
  name: string;
  args: ToolArgs;
};

const MAX_MESSAGE_CHARS = 8000;

function getModelCandidates(): string[] {
  const envModel = process.env.TAMBO_MODEL?.trim();

  return [
    envModel,
    // Matches the model suggested in the issue as the primary free-tier option.
    "gpt-4.1-2025-04-14",
    // Prefer a cheap/free-tier model if the project supports it.
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
  ].filter((m): m is string => Boolean(m));
}

function isModelConfigError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("unknown model") || msg.includes("model not found") || msg.includes("unsupported model");
}

function safeAbort(controller: unknown, state?: { aborted: boolean }) {
  if (state?.aborted) return;

  try {
    if (controller && typeof (controller as { abort?: unknown }).abort === "function") {
      (controller as { abort: () => void }).abort();
      if (state) state.aborted = true;
    }
  } catch (error) {
    console.error("[tambo] Failed to abort stream controller", error);
  }
}

async function runTambo(
  tambo: TamboAI,
  message: string,
  model: string,
  toolChoice: "auto" | "required" | "none" | { name: string } = "auto",
): Promise<{
  reply: string;
  toolCalls: ToolCall[];
  threadId: string | null;
  runId: string | null;
}> {
  const toolCallsById = new Map<string, { name: string; argsJson: string }>();
  const completedToolCalls: ToolCall[] = [];

  let reply = "";
  let threadId: string | null = null;
  let runId: string | null = null;

  const stream = await tambo.threads.runs.create({
    message: {
      role: "user",
      content: [{ type: "text", text: message }],
    },
    model,
    toolChoice,
    tools: [
      {
        name: "AgentGrid",
        description:
          "Render the AgentGrid system monitor when the user asks for status, monitoring, dashboard, system health, or similar. This tool takes no arguments.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    ],
  });

  const abortState = { aborted: false };
  const timeout = setTimeout(() => {
    safeAbort(stream.controller, abortState);
  }, 55_000);

  try {
    for await (const rawEvent of stream as AsyncIterable<unknown>) {
      if (!rawEvent || typeof rawEvent !== "object") continue;
      const event = rawEvent as Record<string, unknown>;
      const type = event.type;
      if (typeof type !== "string") continue;

      if (
        process.env.NODE_ENV !== "production" &&
        ![
          "RUN_STARTED",
          "TEXT_MESSAGE_CONTENT",
          "TOOL_CALL_START",
          "TOOL_CALL_ARGS",
          "TOOL_CALL_END",
          "RUN_ERROR",
          "RUN_FINISHED",
        ].includes(type)
      ) {
        console.debug("[tambo] Unhandled stream event", { type, event });
      }

      if (type === "RUN_STARTED") {
        if (typeof event.threadId === "string") threadId = event.threadId;
        if (typeof event.runId === "string") runId = event.runId;
        continue;
      }

      if (type === "TEXT_MESSAGE_CONTENT" && typeof event.delta === "string") {
        reply += event.delta;
        continue;
      }

      if (type === "TOOL_CALL_START") {
        const toolCallId = typeof event.toolCallId === "string" ? event.toolCallId : null;
        const toolCallName = typeof event.toolCallName === "string" ? event.toolCallName : null;
        if (!toolCallId || !toolCallName) continue;
        toolCallsById.set(toolCallId, { name: toolCallName, argsJson: "" });
        continue;
      }

      if (type === "TOOL_CALL_ARGS") {
        const toolCallId = typeof event.toolCallId === "string" ? event.toolCallId : null;
        const delta = typeof event.delta === "string" ? event.delta : null;
        if (!toolCallId || !delta) continue;
        const existing = toolCallsById.get(toolCallId);
        if (!existing) continue;
        existing.argsJson += delta;
        continue;
      }

      if (type === "TOOL_CALL_END") {
        const toolCallId = typeof event.toolCallId === "string" ? event.toolCallId : null;
        if (!toolCallId) continue;
        const existing = toolCallsById.get(toolCallId);
        if (!existing) continue;

        let args: ToolArgs = {};
        const argsJson = existing.argsJson.trim();
        if (argsJson.length > 0) {
          try {
            const parsed = JSON.parse(argsJson);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              args = parsed as ToolArgs;
            } else {
              console.warn("[tambo] Tool args was not an object", {
                toolCallId,
                toolName: existing.name,
              });
            }
          } catch {
            console.warn("[tambo] Failed to parse tool args as JSON", {
              toolCallId,
              toolName: existing.name,
            });
            args = {};
          }
        }

        completedToolCalls.push({ id: toolCallId, name: existing.name, args });

        if (existing.name === "AgentGrid") {
          safeAbort(stream.controller, abortState);
          break;
        }
        continue;
      }

      if (type === "RUN_ERROR") {
        const message = typeof event.message === "string" ? event.message : "Run failed.";
        throw new Error(message);
      }

      if (type === "RUN_FINISHED") {
        break;
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  if (!reply.trim() && completedToolCalls.some((t) => t.name === "AgentGrid")) {
    reply = "Launching AgentGrid system monitor.";
  }

  return { reply: reply.trim(), toolCalls: completedToolCalls, threadId, runId };
}

export async function POST(req: Request) {
  if (!process.env.TAMBO_API_KEY) {
    return NextResponse.json({ reply: "Missing TAMBO_API_KEY" }, { status: 500 });
  }

  try {
    const tambo = new TamboAI({ apiKey: process.env.TAMBO_API_KEY });

    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ reply: "Missing message" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ reply: `Message too long (max ${MAX_MESSAGE_CHARS} chars)` }, { status: 400 });
    }

    const isShortQuery = message.split(/\s+/).filter(Boolean).length <= 10;
    const forceAgentGrid = isShortQuery && /\b(status|monitor|dashboard|health)\b/i.test(message);

    let lastError: unknown;
    const errorsByModel: Record<string, string> = {};
    for (const model of getModelCandidates()) {
      try {
        const { reply, toolCalls, threadId, runId } = await runTambo(
          tambo,
          message,
          model,
          forceAgentGrid ? { name: "AgentGrid" } : "auto",
        );

        const shouldRenderGrid = toolCalls.some((t) => t.name === "AgentGrid");
        return NextResponse.json({
          reply: reply || "",
          model,
          threadId,
          runId,
          toolCalls,
          // Legacy field for the current frontend, derived from tool calls.
          component: shouldRenderGrid ? "AgentGrid" : null,
        });
      } catch (err) {
        lastError = err;
        if (err instanceof Error) errorsByModel[model] = err.message;
        if (isModelConfigError(err)) continue;

        console.error("[tambo] Model attempt failed", {
          model,
          error: err instanceof Error ? err.message : String(err),
        });

        if (err instanceof Error) throw err;
        throw new Error("Tambo request failed.");
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : "Tambo request failed.";
    console.error("Tambo model attempts failed", { errorsByModel, errorMessage });

    const isProd = process.env.NODE_ENV === "production";
    return NextResponse.json(
      isProd
        ? {
            reply: "Upstream AI service is currently unavailable. Please try again later.",
            errorCode: "TAMBO_UPSTREAM_FAILURE",
          }
        : {
            reply: errorMessage,
            errorCode: "TAMBO_UPSTREAM_FAILURE",
            errorsByModel,
          },
      { status: 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ reply: message }, { status: 500 });
  }
}
