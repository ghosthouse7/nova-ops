"use client";
import { motion } from "framer-motion";

export default function CodeTerminal({ codeLines = "", fileType = "bash" }: any) {
  // Convert string to array for animation
  const lines = codeLines.split("\n");

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 font-mono text-xs">
      <div className="bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="ml-4 text-gray-400">analysis.{fileType}</div>
        </div>
        
        {/* Code Body */}
        <div className="p-4 text-green-400 overflow-x-auto">
            {lines.map((line: string, i: number) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }} // Staggered typing effect
                    className="whitespace-pre"
                >
                    <span className="text-gray-500 mr-2">{i + 1}</span>
                    {line}
                </motion.div>
            ))}
            <motion.div 
                animate={{ opacity: [0, 1] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-green-500 inline-block mt-1"
            />
        </div>
      </div>
    </div>
  );
}