"use client";
import { motion } from "framer-motion"; // Animation Library
import { LucideIcon } from "lucide-react"; // Type for Icons

interface OrbProps {
  label: string;
  color: "red" | "blue" | "green";
  icon: LucideIcon; // Ekhon amra Lucide Icon use korbo
}

export default function Orb({ label, color, icon: Icon }: OrbProps) {
  // Define Neon Colors based on type
  const colors = {
    red: "from-red-500 to-orange-600 shadow-red-500/50",
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/50",
    green: "from-emerald-500 to-green-600 shadow-emerald-500/50",
  };

  const glowColor = color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#10b981";

  return (
    <div className="flex flex-col items-center gap-6 cursor-pointer group">
      
      {/* --- THE ORB (Animated) --- */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }} // Hover korle boro hobe ar ghure jabe
        whileTap={{ scale: 0.9 }}   // Click korle ektu choto hobe (Click feel)
        className="relative"
      >
        {/* Spinning Ring (Outer) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={`absolute -inset-2 rounded-full border border-dashed border-${color === 'red' ? 'red' : color === 'blue' ? 'blue' : 'green'}-500/30`}
        />

        {/* The Core Orb */}
        <div
          className={`
            relative w-24 h-24 rounded-full flex items-center justify-center
            bg-gradient-to-br ${colors[color]}
            shadow-[0_0_50px_rgba(0,0,0,0.5)]
            border border-white/10 backdrop-blur-md
          `}
          style={{ boxShadow: `0 0 30px ${glowColor}60` }} // Custom Glow
        >
          {/* Icon inside */}
          <Icon size={32} className="text-white drop-shadow-md" />
        </div>

        {/* Pulse Effect (Behind) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-full bg-${color === 'red' ? 'red' : color === 'blue' ? 'blue' : 'green'}-500 blur-xl -z-10`}
        />
      </motion.div>

      {/* --- LABEL --- */}
      <motion.span 
        whileHover={{ letterSpacing: "0.2em", color: "#fff" }}
        className="text-gray-500 font-mono text-sm tracking-widest uppercase transition-all duration-300"
      >
        {label}
      </motion.span>
    </div>
  );
}