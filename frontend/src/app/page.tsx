"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { motion } from "framer-motion";
import { Calculator, Sparkles, Settings } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { QuizConfigSheet } from "@/components/quiz/QuizConfigSheet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfigStore } from "@/store/useConfigStore";

interface ModuleData {
  slug: string;
  title: string;
  desc: string;
}

export default function Home() {
  const router = useRouter();
  const { getModuleConfig } = useConfigStore();

  const [configSlug, setConfigSlug] = useState<string | null>(null);

  const { data: modules, isLoading } = useQuery<ModuleData[]>({
    queryKey: ["modules"],
    queryFn: () => fetcher("/quiz/modules"),
  });

  const handlePlay = (slug: string) => {
    router.push(`/quiz/${slug}`);
  };

  return (
    <main id="home-page" className="min-h-screen p-8 flex flex-col items-center max-w-4xl mx-auto">
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
          <h1 className="text-2xl font-bold text-text-main">FloraMath 🌸</h1>
        </motion.div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-brand-light rounded-3xl p-8 mb-12 text-center shadow-sm relative overflow-hidden"
      >
        <Sparkles className="absolute top-4 right-4 text-brand-primary opacity-50" size={32} />
        <h2 className="text-3xl font-extrabold text-brand-primary mb-4">Ready to play?</h2>
        <p className="text-text-muted mb-6">
          Master your math skills with fun, encouraging challenges! You're doing amazing.
        </p>
        <BouncyButton id="progress-link-btn" variant="primary" onClick={() => router.push("/admin")}>
          View My Progress 📊
        </BouncyButton>
      </motion.div>

      {/* Modules Grid */}
      <div className="w-full">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles size={20} className="text-brand-accent" /> Select a Challenge
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-brand-light/50 animate-pulse rounded-3xl" />
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
                <SoftCard data-testid={`module-card-${mod.slug}`} className="h-full flex flex-col justify-between relative">
                  {/* Gear config button — top-right corner */}
                  <motion.button
                    data-testid={`module-config-btn-${mod.slug}`}
                    whileHover={{ rotate: 60, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => setConfigSlug(mod.slug)}
                    className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-brand-primary hover:bg-brand-light transition"
                    title="Configure quiz"
                  >
                    <Settings size={18} />
                  </motion.button>

                  <div className="pr-8">
                    <h4 className="text-xl font-bold text-brand-primary mb-2">{mod.title}</h4>
                    <p className="text-text-muted text-sm">{mod.desc}</p>
                  </div>

                  <div className="mt-4 flex justify-end items-center">
                    <BouncyButton
                      data-testid={`module-play-btn-${mod.slug}`}
                      variant="primary"
                      className="text-sm px-5 py-2"
                      onClick={() => handlePlay(mod.slug)}
                    >
                      Play 🌸
                    </BouncyButton>
                  </div>
                </SoftCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Config Sheet — rendered outside the grid so it overlays correctly */}
      {configSlug && (
        <QuizConfigSheet
          slug={configSlug}
          isOpen={!!configSlug}
          onClose={() => setConfigSlug(null)}
          onPlay={() => handlePlay(configSlug)}
        />
      )}
    </main>
  );
}
