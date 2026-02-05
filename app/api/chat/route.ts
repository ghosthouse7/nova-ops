import { NextResponse } from "next/server";

// NOVA OPS BACKEND - "NO USER KEY ERROR" VERSION
// We bypass the SDK and talk directly to the API to avoid strict validation errors.

export async function POST(req: Request) {
  const apiKey = process.env.TAMBO_API_KEY;
  const projectId = process.env.TAMBO_PROJECT_ID?.trim();

  try {
    const body = await req.json();
    const message = body.message || "";
    const lowerMsg = message.toLowerCase();
    
    console.log(`🔥 Nova Brain Active: "${message}"`);

    // --- 1. DEFINE TOOLS ---
    const tools = [
      {
        type: "function",
        function: {
          name: "AgentGrid",
          description: "Shows system status dashboard.",
          parameters: {
            type: "object",
            properties: {
              mode: { type: "string", enum: ["safe", "caution", "critical"] },
              message: { type: "string" },
            },
            required: ["mode", "message"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "CodeTerminal",
          description: "Displays a hacking/code terminal for analysis.",
          parameters: {
            type: "object",
            properties: {
              codeLines: { type: "string" },
              fileType: { type: "string", enum: ["bash", "typescript", "json"] }
            },
            required: ["codeLines", "fileType"],
          },
        },
      },
    ];

    // --- 2. TRY REAL API (With Hardcoded User) ---
    let aiResult = null;
    try {
        if (apiKey && projectId) {
            const response = await fetch("https://api.tambo.ai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "x-project-id": projectId,
              },
              body: JSON.stringify({
                model: "gpt-4.1-2025-04-14",
                messages: [
                  { role: "system", content: "You are NOVA, a sentient Cyber-Defense AI. Use tools to visualize data." },
                  { role: "user", content: message }
                ],
                tools: tools,
                tool_choice: "auto",
                // 🔥 THE FIX: Hardcoding the user identifier prevents the 400 error
                user: "nova_commander_v1", 
              }),
            });

            if (response.ok) {
                aiResult = await response.json();
            } else {
                console.warn("⚠️ API Error:", await response.text());
            }
        }
    } catch (e) {
        console.warn("⚠️ API Connection Failed (Switching to Local Core)");
    }

    // --- 3. HYBRID LOGIC (Fallback) ---
    // Even if API fails, we return a valid response so the Demo NEVER breaks.
    
    let component = null;
    let componentProps = {};
    let replyText = "System ready.";

    // SCENARIO A: AI Worked
    if (aiResult?.choices?.[0]?.message?.tool_calls) {
        const tool = aiResult.choices[0].message.tool_calls[0];
        if (tool.function.name === "AgentGrid") {
            component = "AgentGrid";
            componentProps = JSON.parse(tool.function.arguments);
            replyText = "Visualizing System Matrix.";
        } else if (tool.function.name === "CodeTerminal") {
            component = "CodeTerminal";
            componentProps = JSON.parse(tool.function.arguments);
            replyText = "Initializing Analysis Protocol...";
        } else {
            replyText = aiResult.choices[0].message.content || "Command Processed.";
        }
    } 
    // SCENARIO B: AI Failed (Local Logic Override)
    else {
        console.log("⚡ ENGAGING LOCAL BACKUP");
        
        if (lowerMsg.includes("analyze") || lowerMsg.includes("scan") || lowerMsg.includes("code")) {
            component = "CodeTerminal";
            componentProps = {
                fileType: "bash",
                codeLines: "> TARGET: UNKNOWN_PROXY\n> TRACING PACKETS... [||||||||||] 100%\n> THREAT DETECTED."
            };
            replyText = "Analysis Complete. Threat identified.";
        }
        else if (lowerMsg.includes("hack") || lowerMsg.includes("danger") || lowerMsg.includes("critical") || lowerMsg.includes("alert")) {
            component = "AgentGrid";
            componentProps = { mode: "critical", message: "⚠️ SECURITY BREACH" };
            replyText = "ALERT: Defense systems engaged.";
        } 
        else if (lowerMsg.includes("status") || lowerMsg.includes("monitor")) {
            component = "AgentGrid";
            componentProps = { mode: "safe", message: "SYSTEM OPTIMAL" };
            replyText = "System Status: Online.";
        }
        else {
            replyText = "Nova System Online. Awaiting command.";
        }
    }

    return NextResponse.json({ 
      reply: replyText, 
      component: component,
      componentProps: componentProps 
    });

  } catch (error: any) {
    console.error("💀 Fatal Error:", error.message);
    return NextResponse.json({ reply: "System Malfunction." }, { status: 500 });
  }
}