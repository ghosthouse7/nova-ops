"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { playAlert, playSuccess } from "@/utils/sound";

const CRITICAL_SHAKE_X = [0, -6, 6, -6, 6, 0];

interface AgentGridProps {
  mode?: "safe" | "caution" | "critical";
  message?: string;
}

export default function AgentGrid({ mode = "safe", message = "SYSTEM NORMAL" }: AgentGridProps) {
  // 1. DYNAMIC DATA STATE (Live Numbers)
  const [metrics, setMetrics] = useState({ cpu: 12, mem: 45, net: 20 });
  const [logs, setLogs] = useState<string[]>([]);
  const prevModeRef = useRef<"safe" | "caution" | "critical" | null>(null);
  const stopAlertRef = useRef<null | (() => void)>(null);

  // 2. THEME CONFIGURATION
  const themes = {
    safe: { color: "cyan", hex: "#22d3ee", bg: "bg-cyan-500", border: "border-cyan-500", shadow: "shadow-cyan-500/50" },
    caution: { color: "yellow", hex: "#facc15", bg: "bg-yellow-500", border: "border-yellow-500", shadow: "shadow-yellow-500/50" },
    critical: { color: "red", hex: "#ef4444", bg: "bg-red-600", border: "border-red-600", shadow: "shadow-red-600/80" },
  };
  const theme = themes[mode];
  const isCritical = mode === "critical";
  const accentTextClass = isCritical ? "text-red-400" : mode === "caution" ? "text-yellow-400" : "text-cyan-400";
  const containerBgClass = isCritical ? "bg-red-950/60" : "bg-black/80";

  useEffect(() => {
    const prevMode = prevModeRef.current;

    if (mode === "critical") {
      stopAlertRef.current?.();
      stopAlertRef.current = playAlert();
    } else {
      if (prevMode === "critical") {
        stopAlertRef.current?.();
        stopAlertRef.current = null;
      }

      if (prevMode !== null && prevMode !== "safe" && mode === "safe") {
        playSuccess();
      }
    }

    prevModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      stopAlertRef.current?.();
      stopAlertRef.current = null;
    };
  }, []);

  // 3. LIVE SIMULATION EFFECT (Heartbeat)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomize numbers based on Stress Level
      const stress = mode === "critical" ? 40 : 5;
      const base = mode === "critical" ? 50 : 20;
      
      setMetrics({
        cpu: Math.min(100, Math.floor(Math.random() * stress + base)),
        mem: Math.min(100, Math.floor(Math.random() * stress + base + 10)),
        net: Math.min(100, Math.floor(Math.random() * stress + base - 5)),
      });

      // Add Fake Hacker Logs
      const newLog = `> PROCESS_${Math.floor(Math.random() * 9999)} [${mode.toUpperCase()}]: ${
        mode === "critical" ? "UNAUTHORIZED ACCESS" : "PACKET_VERIFIED"
      }`;
      setLogs((prev) => [newLog, ...prev].slice(0, 5)); // Keep last 5 logs
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 font-mono text-xs md:text-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode} // Force re-render on mode change
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            // SHAKE EFFECT IF CRITICAL
            x: isCritical ? CRITICAL_SHAKE_X : 0,
          }}
          transition={{ duration: 0.4 }}
          className={`relative border-2 ${theme.border} ${containerBgClass} rounded-lg p-4 md:p-6 overflow-hidden ${theme.shadow} shadow-2xl`}
        >
          
          {/* BACKGROUND GRID ANIMATION */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: `linear-gradient(${theme.hex} 1px, transparent 1px), linear-gradient(90deg, ${theme.hex} 1px, transparent 1px)`, backgroundSize: "20px 20px" }}>
          </div>

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ opacity: [1, 0.2, 1] }} 
                transition={{ duration: mode === "critical" ? 0.2 : 1.5, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${theme.bg}`} 
              />
              <h2 className={`text-lg font-bold tracking-[0.2em] ${accentTextClass}`}>
                NOVA SYSTEM
              </h2>
            </div>
            <div className={`px-2 py-1 rounded border ${theme.border} ${accentTextClass} text-[10px] font-bold`}>
              {mode.toUpperCase()}
            </div>
          </div>

          {/* MAIN VISUALS */}
          <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
            {/* CPU GAUGE */}
            <div className={`col-span-1 p-3 border ${theme.border} bg-white/5 rounded flex flex-col items-center justify-center`}>
               <span className="text-white/50 mb-1">CPU LOAD</span>
               <span className={`text-3xl font-bold ${accentTextClass}`}>{metrics.cpu}%</span>
               <motion.div className="w-full h-1 bg-gray-700 mt-2 rounded overflow-hidden">
                 <motion.div animate={{ width: `${metrics.cpu}%` }} className={`h-full ${theme.bg}`} />
               </motion.div>
            </div>

            {/* MEMORY GAUGE */}
            <div className={`col-span-1 p-3 border ${theme.border} bg-white/5 rounded flex flex-col items-center justify-center`}>
               <span className="text-white/50 mb-1">MEMORY</span>
               <span className={`text-3xl font-bold ${accentTextClass}`}>{metrics.mem}%</span>
               <motion.div className="w-full h-1 bg-gray-700 mt-2 rounded overflow-hidden">
                 <motion.div animate={{ width: `${metrics.mem}%` }} className={`h-full ${theme.bg}`} />
               </motion.div>
            </div>

            {/* SECURITY STATUS */}
            <div className={`col-span-1 p-3 border ${theme.border} bg-white/5 rounded flex flex-col items-center justify-center text-center`}>
               <span className="text-white/50 mb-1">NETWORK</span>
               <span className={`text-lg font-bold ${isCritical ? "text-red-500 animate-pulse" : accentTextClass}`}>
                 {isCritical ? "UNSTABLE" : "SECURE"}
               </span>
            </div>
          </div>

          {/* SCROLLING TERMINAL LOGS */}
          <div className="bg-black/50 p-2 rounded border border-white/10 font-mono text-[10px] h-24 overflow-hidden relative z-10">
            <div className="absolute top-0 right-0 px-1 bg-white/10 text-white/50">LOGS</div>
            <div className="flex flex-col gap-1 mt-4">
              {logs.map((log, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  className={`truncate ${mode === "critical" ? "text-red-400" : "text-green-400/70"}`}
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </div>

          {/* FOOTER MESSAGE */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-center font-bold tracking-widest uppercase ${accentTextClass}`}
          >
             &gt;&gt; {message} &lt;&lt;
          </motion.div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
