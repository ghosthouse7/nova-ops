"use client";
import { ShieldAlert, Zap, Activity } from "lucide-react";

interface HeroProps {
  onTrigger: (command: string) => void;
}

export default function HeroSection({ onTrigger }: HeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-10 mt-10 animate-in fade-in duration-1000">
      
      {/* GLOWING TITLE */}
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        NOVA-OPS
      </h1>
      
      <p className="text-sm md:text-base tracking-[0.5em] text-cyan-500 font-bold uppercase mb-16 opacity-80">
        Command Interface • Online
      </p>

      {/* THE 3 BUTTONS FROM YOUR SCREENSHOT */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        
        {/* 1. SECURITY (Orange) */}
        <button 
          onClick={() => onTrigger("Run full security scan")}
          className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
        >
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] group-hover:bg-orange-500 text-orange-500 group-hover:text-black transition-all duration-300">
            <ShieldAlert size={32} />
          </div>
          <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">Security</span>
        </button>

        {/* 2. DEPLOY (Blue) */}
        <button 
          onClick={() => onTrigger("Initialize deployment sequence")}
          className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] group-hover:bg-blue-500 text-blue-500 group-hover:text-black transition-all duration-300">
            <Zap size={32} />
          </div>
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Deploy</span>
        </button>

        {/* 3. CONFIG/LIFE (Green) */}
        <button 
          onClick={() => onTrigger("Check system health and life support")}
          className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] group-hover:bg-green-500 text-green-500 group-hover:text-black transition-all duration-300">
            <Activity size={32} />
          </div>
          <span className="text-xs font-bold tracking-widest text-green-500 uppercase">Config</span>
        </button>

      </div>
    </div>
  );
}