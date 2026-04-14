"use client";

import { motion } from "framer-motion";
import React from "react";

interface SoftCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SoftCard({ children, className = "", onClick }: SoftCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { 
        y: -6, 
        scale: 1.01,
        boxShadow: "0 25px 30px -5px rgba(255, 182, 193, 0.35)",
        borderColor: "rgba(255, 182, 193, 0.8)"
      } : {}}
      whileTap={onClick ? { 
        scale: 0.98,
        y: 0,
        boxShadow: "0 10px 15px -3px rgba(255, 182, 193, 0.2)"
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`bg-surface rounded-3xl p-6 shadow-md border border-brand-light transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
