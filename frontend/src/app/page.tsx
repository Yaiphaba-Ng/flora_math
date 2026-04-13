"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { motion } from "framer-motion";
import { Calculator, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BouncyButton } from "@/components/ui/BouncyButton";

interface ModuleData {
  slug: str;
  title: str;
  desc: str;
}

export default function Home() {
  const { soundEnabled, toggleSound } = useAppStore();
  
  const { data: modules, isLoading } = useQuery<ModuleData[]>({
    queryKey: ["modules"],
    queryFn: () => fetcher("/quiz/modules")
  });

  return (
    <main className="min-h-screen p-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-brand-primary p-3 rounded-2xl shadow-sm text-white">
            <Calculator size={24} />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Floramath 🌸</h1>
        </motion.div>

        <button 
          onClick={toggleSound}
          className="p-3 rounded-full bg-surface shadow-sm text-brand-primary hover:bg-brand-light transition text-brand-accent"
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </header>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-brand-light rounded-3xl p-8 mb-12 text-center shadow-sm relative overflow-hidden"
      >
        <Sparkles className="absolute top-4 right-4 text-brand-primary opacity-50" size={32} />
        <h2 className="text-3xl font-extrabold text-brand-primary mb-4">Ready to play?</h2>
        <p className="text-text-muted mb-6">Master your math skills with fun, encouraging challenges! Youre doing amazing.</p>
        <BouncyButton variant="primary">View My Progress</BouncyButton>
      </motion.div>

      {/* Modules Grid */}
      <div className="w-full">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
           <Sparkles size={20} className="text-brand-accent" /> Select a Challenge
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[1, 2, 3].map((i) => (
               <div key={i} className="h-40 bg-brand-light/50 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {modules?.map((mod, index) => (
              <motion.div
                key={mod.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SoftCard onClick={() => window.location.href = `/quiz/${mod.slug}`} className="h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-brand-primary mb-2">{mod.title}</h4>
                    <p className="text-text-muted text-sm">{mod.desc}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="text-brand-accent font-bold text-sm bg-brand-light px-3 py-1 rounded-full">Play</span>
                  </div>
                </SoftCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
