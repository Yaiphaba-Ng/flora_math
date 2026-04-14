"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const FLOWER_DEFS = [
  { top: 5, left: 5, size: 80, rot: 0 },
  { top: 12, left: 80, size: 120, rot: 45 },
  { top: 40, left: 10, size: 60, rot: 90 },
  { top: 65, left: 70, size: 100, rot: 135 },
  { top: 80, left: 12, size: 90, rot: 180 },
  { top: 25, left: 90, size: 70, rot: 225 },
  { top: 50, left: 85, size: 110, rot: 270 },
  { top: 20, left: 18, size: 50, rot: 315 },
  { top: 85, left: 45, size: 85, rot: 10 },
  { top: 2, left: 40, size: 65, rot: 55 },
  { top: 35, left: 30, size: 95, rot: 100 },
  { top: 60, left: 5, size: 75, rot: 145 },
  { top: 75, left: 90, size: 130, rot: 190 },
  { top: 95, left: 75, size: 55, rot: 235 },
  { top: 15, left: 50, size: 105, rot: 280 },
];

interface StaticFlower {
  top: number;
  left: number;
  size: number;
  rotation: number;
}

export function FloatingFlowers() {
  const [placedFlowers, setPlacedFlowers] = useState<StaticFlower[]>([]);

  useEffect(() => {
    // Calculate positions in pixels ONCE to prevent jumping on mobile resize
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const staticPositions = FLOWER_DEFS.map(f => ({
      top: (f.top / 100) * h,
      left: (f.left / 100) * w,
      size: f.size,
      rotation: f.rot
    }));
    
    setPlacedFlowers(staticPositions);
  }, []);

  if (placedFlowers.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      {placedFlowers.map((flower, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: flower.top,
            left: flower.left,
            fontSize: flower.size,
            transform: `rotate(${flower.rotation}deg)`,
            opacity: 0.6, // Higher base opacity for better saturation
          }}
          // filter: saturate(2) and contrast(1.1) to pop colors on mobile
          // drop-shadow provides a "halo" that helps maintain saturation
          className="filter saturate-[2] contrast-[1.1] drop-shadow-[0_0_2px_rgba(255,182,193,0.8)]"
        >
          🌸
        </div>
      ))}
    </div>
  );
}
