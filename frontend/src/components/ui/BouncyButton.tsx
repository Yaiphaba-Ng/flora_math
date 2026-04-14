"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface BouncyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function BouncyButton({ children, variant = 'primary', className = '', ...props }: BouncyButtonProps) {
  const baseClasses = "font-bold rounded-2xl px-6 py-3 transition-all shadow-md outline-none focus:ring-4 relative overflow-hidden active:shadow-none";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-accent focus:ring-brand-light shadow-brand-primary/25 hover:shadow-brand-primary/40",
    secondary: "bg-surface text-brand-primary border-2 border-brand-light hover:bg-brand-light focus:ring-brand-light shadow-brand-light/20",
    outline: "bg-transparent text-text-muted hover:text-brand-primary focus:ring-brand-light"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.92, rotate: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Subtle shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}
