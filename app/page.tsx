"use client"; 

import { useState } from "react";
import { motion } from "framer-motion"; // Animation Power
import Orb from "./components/droids/Orb";
import TerminalModal from "./components/TerminalModal";
import StarBackground from "./components/StarBackground"; // Galaxy Import
import AgentGrid from "./components/droids/AgentGrid"; // The Brain Monitor
import LogTicker from "./components/droids/LogTicker";
import { ShieldAlert, Rocket, Cpu } from "lucide-react";
import { playClick } from "@/utils/sound";

export default function Home() {
  const [activeOrb, setActiveOrb] = useState<string | null>(null);

  // Animation Variant for Title Letters
  const titleVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 } // Ekta ekta letter ashbe
    }),
  };

  const titleText = "NOVA-OPS".split(""); // Text ke bhenge dilam

  return (
    <main className="relative min-h-screen text-white flex flex-col items-center justify-center overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- 1. GALAXY BACKGROUND (Z-Index 0) --- */}
      <StarBackground />
      
      {/* Terminal Popup (Z-Index 50) */}
      {activeOrb && (
        <TerminalModal type={activeOrb} onClose={() => setActiveOrb(null)} onSend={playClick} />
      )}

      {/* --- 2. SYSTEM MONITOR (Agent Grid) --- */}
      {/* Eta screen er Bottom-Right corner-e thakbe */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 right-8 z-20 hidden lg:block" // Shudhu boro screen-e dekhabe
      >
        <AgentGrid />
      </motion.div>

      <div className="z-10 flex flex-col items-center w-full max-w-6xl px-4">
        
        {/* --- 3. ANIMATED HEADER --- */}
        <div className="text-center mb-28 relative">
          
          {/* Glowing Aura behind text */}
          <div className="absolute -inset-10 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />

          {/* Staggered Letter Animation */}
          <h1 className="flex justify-center text-7xl md:text-9xl font-black tracking-tighter drop-shadow-2xl">
            {titleText.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={titleVariant}
                whileHover={{ scale: 1.2, color: "#38bdf8", rotate: i % 2 === 0 ? 5 : -5 }} // Mouse nile natchbe
                className="cursor-default bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 hover:to-blue-400 transition-colors"
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle with Typing Effect */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex items-center justify-center gap-3 mt-4 text-sm tracking-[0.6em] text-blue-200 font-mono uppercase"
          >
            <span className="animate-pulse">System Status</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold">OPTIMAL</span>
          </motion.div>
        </div>

        {/* --- 4. ORBS CONTAINER (Floating & Interactive) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-40"
        >
          {/* Security */}
          <div onClick={() => setActiveOrb("Security")}>
            <Orb label="Security" color="red" icon={ShieldAlert} />
          </div>
          
          {/* Deploy */}
          <div onClick={() => setActiveOrb("Deploy")}>
            <Orb label="Deploy" color="blue" icon={Rocket} />
          </div>
          
          {/* Config */}
          <div onClick={() => setActiveOrb("Config")}>
            <Orb label="Config" color="green" icon={Cpu} />
          </div>
        </motion.div>

        {/* --- 5. FOOTER (Bottom Status) --- */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 font-mono text-[10px] text-gray-500 tracking-[0.3em] uppercase w-full text-center pointer-events-none"
        >
          v4.0.1 // Automated Command Interface // Galactic Core
        </motion.div>
      
      </div>

      <LogTicker />
    </main>
  );
}
