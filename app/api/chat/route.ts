import { NextResponse } from "next/server";
import { TamboAI } from "@tambo-ai/typescript-sdk";

// Initialize with API Key
const tambo = new TamboAI({
  apiKey: process.env.TAMBO_API_KEY,
});

type ToolCall = {
  id: string;
  name: string;
  args: unknown;
};

function getModelCandidates(): string[] {
  const envModel = process.env.TAMBO_MODEL?.trim();
  return [
    envModel,
    "gpt-4.1-2025-04-14", 
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
  ].filter((m): m is string => Boolean(m));
}

function safeAbort(controller: AbortController) {
  try { controller.abort(); } catch { }
}

async function runTambo(
  projectId: string, 
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

  // --- THE FIX IS HERE ---
  const stream = await tambo.threads.runs.create({
    // @ts-ignore
    projectId: projectId,
    
    // 🔥 NEW LINE: WE GIVE A FAKE USER ID
    userKey: "nova_demo_user_01", 
    
    message: {
      role: "user",
      content: [{ type: "text", text: message }],
    },
    model,
    toolChoice,
    tools: [
      {
        name: "AgentGrid",
        description: "Render the AgentGrid system monitor.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    ],
  });

  const timeout = setTimeout(() => {
    safeAbort(stream.controller);
  }, 55_000);

  try {
    for await (const rawEvent of stream as AsyncIterable<unknown>) {
      if (!rawEvent || typeof rawEvent !== "object") continue;
      const event = rawEvent as Record<string, unknown>;
      const type = event.type;
      
      if (typeof type !== "string") continue;

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

        let args: unknown = {};
        const argsJson = existing.argsJson.trim();
        if (argsJson.length > 0) {
          try { args = JSON.parse(argsJson); } catch { args = argsJson; }
        }
        completedToolCalls.push({ id: toolCallId, name: existing.name, args });

        if (existing.name === "AgentGrid") {
          safeAbort(stream.controller);
          break;
        }
        continue;
      }

      if (type === "RUN_ERROR") {
        const message = typeof event.message === "string" ? event.message : "Run failed.";
        throw new Error(message);
      }
      if (type === "RUN_FINISHED") break;
    }
  } finally {
    clearTimeout(timeout);
  }

  return { reply: reply.trim(), toolCalls: completedToolCalls, threadId, runId };
}

export async function POST(req: Request) {
  if (!process.env.TAMBO_API_KEY) {
    return NextResponse.json({ reply: "Missing TAMBO_API_KEY" }, { status: 500 });
  }

  const projectId = process.env.TAMBO_PROJECT_ID?.trim();
  if (!projectId) {
     return NextResponse.json({ reply: "Missing TAMBO_PROJECT_ID" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ reply: "Missing message" }, { status: 400 });
    }

    const isShortQuery = message.split(/\s+/).filter(Boolean).length <= 10;
    const forceAgentGrid = isShortQuery && /\b(status|monitor|dashboard|health)\b/i.test(message);

    let lastError: unknown;
    
    for (const model of getModelCandidates()) {
      try {
        console.log(`Trying model: ${model} with userKey on project: ${projectId}`);
        const { reply, toolCalls, threadId, runId } = await runTambo(
          projectId, 
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
          component: shouldRenderGrid ? "AgentGrid" : null,
        });
      } catch (err) {
        console.error(`Model ${model} failed:`, err);
        lastError = err;
        continue; // Try next model
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : "Tambo request failed.";
    return NextResponse.json({ reply: errorMessage }, { status: 500 });
  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ reply: "Unexpected error" }, { status: 500 });
  }
}