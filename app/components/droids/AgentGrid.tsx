"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AgentGrid() {
  const [agents, setAgents] = useState<{ id: number; status: "active" | "idle" | "alert" }[]>([]);
  const [cpu, setCpu] = useState(12); // Initial Fixed Value (No Random here!)

  useEffect(() => {
    // 1. Generate Random Agents
    const generateAgents = () => {
      return Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        status: Math.random() > 0.9 ? "alert" : Math.random() > 0.7 ? "active" : "idle",
      }));
    };

    setAgents(generateAgents() as any);

    // 2. Interval setup (Updates CPU & Agents every 2s)
    const interval = setInterval(() => {
      setAgents(generateAgents() as any);
      setCpu(Math.floor(Math.random() * 30 + 10)); // Random logic moved inside Effect
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // --- PREVENT HYDRATION MISMATCH ---
  // Jodi agents load na hoye thake, kisu dekhabo na (Loading state)
  if (agents.length === 0) return null; 

  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 w-64 shadow-2xl">
      {/* Title */}
      <div className="col-span-6 flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Agent Network</span>
        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>

      {/* The Grid Nodes */}
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
            h-2 w-2 rounded-sm transition-all duration-500
            ${agent.status === "active" ? "bg-cyan-500 shadow-[0_0_8px_cyan]" : ""}
            ${agent.status === "alert" ? "bg-red-500 shadow-[0_0_8px_red] animate-ping" : ""}
            ${agent.status === "idle" ? "bg-gray-800" : ""}
          `}
        />
      ))}

      {/* Stats Footer (Now using State) */}
      <div className="col-span-6 mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-gray-500 flex justify-between">
        <span>CPU: {cpu}%</span> {/* FIXED: Using State Variable */}
        <span>RAM: 14GB</span>
      </div>
    </div>
  );
}