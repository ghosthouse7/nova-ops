import { NextResponse } from "next/server";

// NOVA OPS BRAIN v5.0 (Final Stable)
export async function POST(req: Request) {
  const apiKey = process.env.TAMBO_API_KEY;
  const projectId = process.env.TAMBO_PROJECT_ID?.trim();

  try {
    const body = await req.json();
    const message = body.message || "";
    const lowerMsg = message.toLowerCase();

    const securityBreachTriggered =
      lowerMsg.includes("hack") ||
      lowerMsg.includes("hacked") ||
      lowerMsg.includes("breach") ||
      lowerMsg.includes("danger") ||
      lowerMsg.includes("alert") ||
      lowerMsg.includes("critical");

    const criticalComponentProps = { mode: "critical", message: "⚠️ SECURITY BREACH" };
    
    console.log(`🔥 Nova Processing: "${message}"`);

    // 1. DEFINE TOOLS
    const tools = [
      {
        type: "function",
        function: {
          name: "AgentGrid",
          description: "Display system monitor.",
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
    ];

    // 2. TRY REAL API (With Fix for UserKey Error)
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
                messages: [{ role: "user", content: message }],
                tools: tools,
                tool_choice: "auto",
                user: "nova_commander", // <--- EI LINE TA ERROR FIX KORBE
              }),
            });
            
            if (response.ok) {
                aiResult = await response.json();
            } else {
                console.warn("⚠️ API Error Response:", await response.text());
            }
        }
    } catch {
        console.warn("⚠️ API Failed, switching to backup.");
    }

    // 3. DECISION ENGINE (The Hybrid Logic)
    let component = null;
    let componentProps = {};
    let replyText = "System ready.";

    // SCENARIO A: API Worked
    if (aiResult?.choices?.[0]?.message?.tool_calls) {
        const tool = aiResult.choices[0].message.tool_calls[0];
        if (tool.function.name === "AgentGrid") {
            component = "AgentGrid";
            componentProps = JSON.parse(tool.function.arguments);
            replyText = "Tambo AI: Visualizing Data.";
        }
    } 
    // SCENARIO B: API Failed (Local Backup)
    else {
        console.log("⚡ ENGAGING LOCAL BACKUP");
        
        // EKHANE TOR RED LOGIC ACHE
        if (securityBreachTriggered) {
            component = "AgentGrid";
            componentProps = criticalComponentProps;
            replyText = "ALERT: Unauthorized Access! Engaging Defense Grid.";
        } 
        else if (lowerMsg.includes("status") || lowerMsg.includes("monitor") || lowerMsg.includes("safe")) {
            component = "AgentGrid";
            componentProps = { mode: "safe", message: "ALL SYSTEMS NOMINAL" };
            replyText = "System Status: Online. Monitoring active.";
        }
        else {
            replyText = "Nova System Online. Awaiting commands.";
        }
    }

    if (securityBreachTriggered) {
        component = "AgentGrid";
        componentProps = criticalComponentProps;
        replyText = "ALERT: Unauthorized Access! Engaging Defense Grid.";
    }

    return NextResponse.json({ 
      reply: replyText, 
      component: component,
      componentProps: componentProps 
    });

  } catch {
    return NextResponse.json({ reply: "System Malfunction." }, { status: 500 });
  }
}
