"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StarBackground() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    // 100-ta Tara banacchi random position-e
    const starArray = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Random % Left
      y: Math.random() * 100, // Random % Top
      size: Math.random() * 2 + 1, // Size 1px to 3px
      delay: Math.random() * 5, // Random Blink Speed
    }));
    setStars(starArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 1. DEEP SPACE GRADIENT (Dark Galaxy Base) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617]" />

      {/* 2. MOVING STARS */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2], // Micmit kora (Twinkle)
            scale: [1, 1.5, 1],     // Choto-Boro howa
          }}
          transition={{
            duration: Math.random() * 3 + 2, // 2s to 5s speed
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 3. SHOOTING STARS (Meteor Shower) - Majhe majhe ashbe */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`meteor-${i}`}
            className="absolute h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0"
            animate={{
              x: ["-10vw", "100vw"], // Bam theke Dan
              y: [Math.random() * 100, Math.random() * 100 + 20], // Kona-kuni
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 10 + 5, // Random delay
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}