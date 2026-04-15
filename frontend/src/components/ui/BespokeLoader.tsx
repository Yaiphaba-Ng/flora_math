"use client";

import { motion } from "framer-motion";
import { Flower } from "lucide-react";

export const BespokeLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12 overflow-hidden relative bg-surface">
      {/* Background Blobs — soft, drifting colors */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[100px] -z-10"
        animate={{
          x: [-40, 40, -40],
          y: [-40, 40, -40],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-brand-accent/10 blur-[80px] -z-10"
        style={{ top: "20%", right: "5%" }}
        animate={{
          x: [30, -30, 30],
          y: [30, -30, 30],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Central Animation: Mathematical Symbols in Orbit */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Subtle Orbit Rings */}
        <div className="absolute inset-0 border border-brand-primary/10 rounded-full shadow-inner" />
        <div className="absolute inset-8 border border-brand-accent/10 rounded-full" />
        
        {/* Rotating Symbols around the center */}
        {[
          { char: "+", color: "text-brand-accent" },
          { char: "−", color: "text-brand-primary" },
          { char: "×", color: "text-brand-accent" },
          { char: "÷", color: "text-brand-primary" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className={`absolute text-4xl font-extrabold ${item.color} filter drop-shadow-sm select-none pointer-events-none`}
            animate={{
              // Orbiting motion: rotate the container, and counter-rotate the symbol to keep it upright
              rotate: 360,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              delay: idx * -1.25, // offset them
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              animate={{
                rotate: -360, // keep symbol upright
                scale: [1, 1.3, 1],
              }}
              transition={{
                rotate: { duration: 5, repeat: Infinity, ease: "linear", delay: idx * -1.25 },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {item.char}
            </motion.div>
          </motion.div>
        ))}

        {/* Center: A glowing, pulsing core with a Daisy */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(255, 182, 193, 0.2)",
              "0 0 40px rgba(255, 182, 193, 0.5)",
              "0 0 20px rgba(255, 182, 193, 0.2)",
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-brand-primary/20 z-10"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <Flower size={52} className="text-brand-light fill-white stroke-[1.5]" />
            <div className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Loading Text with glowing effect */}
      <div className="text-center relative">
        <motion.h3
          animate={{ 
            opacity: [0.6, 1, 0.6],
            y: [0, -2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl font-extrabold text-brand-accent tracking-tight mb-2 filter drop-shadow-sm"
        >
          Loading your challenge...
        </motion.h3>
        <p className="text-text-muted font-bold text-xs uppercase tracking-[0.2em] opacity-50">
          Cultivating fresh numbers
        </p>
      </div>
    </div>
  );
};
