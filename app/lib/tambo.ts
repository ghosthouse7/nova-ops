import { z } from "zod";
// Import the visual component we want the AI to generate
import AgentGrid from "../components/droids/AgentGrid";

export const tamboConfig = {
  // 1. COMPONENTS: Register components that the AI can render
  components: [
    {
      name: "AgentGrid",
      description: "A futuristic system monitor dashboard showing active neural agents, CPU usage, and network status. Use this component when the user asks for 'status', 'system check', 'dashboard', 'monitor', or 'health report'.",
      component: AgentGrid,
      propsSchema: z.object({
        // No props required for this internal dashboard component
      }),
    },
  ],
  // 2. TOOLS: Standard functions the AI can call
  tools: [
    {
      name: "get_current_time",
      description: "Get the current server time.",
      tool: async () => new Date().toLocaleTimeString(),
      inputSchema: z.object({}), 
    },
  ],
};