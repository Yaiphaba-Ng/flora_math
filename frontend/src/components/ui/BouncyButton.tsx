"use client";

import { motion } from "framer-motion";
import React from "react";

interface BouncyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function BouncyButton({ children, variant = 'primary', className = '', ...props }: BouncyButtonProps) {
  const baseClasses = "font-bold rounded-2xl px-6 py-3 transition-colors shadow-sm outline-none focus:ring-4 relative overflow-hidden";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-accent focus:ring-brand-light",
    secondary: "bg-surface text-brand-primary border-2 border-brand-light hover:bg-brand-light focus:ring-brand-light",
    outline: "bg-transparent text-text-muted hover:text-brand-primary focus:ring-brand-light"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
