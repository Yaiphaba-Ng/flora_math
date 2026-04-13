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
      whileHover={onClick ? { y: -5, boxShadow: "0 20px 25px -5px rgba(255, 182, 193, 0.2)" } : {}}
      onClick={onClick}
      className={`bg-surface rounded-3xl p-6 shadow-md border border-brand-light transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
