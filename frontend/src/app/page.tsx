"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { motion } from "framer-motion";
import { Calculator, Sparkles, Settings } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { QuizConfigSheet } from "@/components/quiz/QuizConfigSheet";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useConfigStore } from "@/store/useConfigStore";
import { useQuoteOfDay } from "@/hooks/useQuoteOfDay";

interface ModuleData {
  slug: string;
  title: string;
  desc: string;
}

import { BespokeLoader } from "@/components/ui/BespokeLoader";

import { useLoadingStore } from "@/store/useLoadingStore";

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getModuleConfig } = useConfigStore();
  const [configSlug, setConfigSlug] = useState<string | null>(null);
  const { quote, isFirstLoad } = useQuoteOfDay();
  const { setIsLoading } = useLoadingStore();

  // PREFETCH ADMIN DATA AS SOON AS HOME PAGE MOUNTS
  useEffect(() => {
    // Prefetch "all" views for admin dashboard so it's snappy
    queryClient.prefetchQuery({
      queryKey: ["admin", "overview", "all"],
      queryFn: () => fetcher("/admin/metrics/overview?module=all"),
    });
    queryClient.prefetchQuery({
      queryKey: ["admin", "weak-spots", "all"],
      queryFn: () => fetcher("/admin/metrics/weak-spots?module=all"),
    });
    queryClient.prefetchQuery({
      queryKey: ["admin", "recent-sessions", "all"],
      queryFn: () => fetcher("/admin/sessions/recent?module=all"),
    });
  }, [queryClient]);

  const { data: modules, isLoading } = useQuery<ModuleData[]>({
    queryKey: ["modules"],
    queryFn: () => fetcher("/quiz/modules"),
  });

  // First-ever visit: show a short friendly splash until the quote arrives
  if (isFirstLoad) {
    return <BespokeLoader />;
  }

  const handlePlay = (slug: string) => {
    setIsLoading(true);
    router.push(`/quiz/${slug}`);
  };

  return (
    <main id="home-page" className="min-h-screen p-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header / Title Bar */}
      <header className="w-full flex flex-col md:flex-row justify-center md:justify-between items-center mb-12 bg-[#FFF9FB]/80 backdrop-blur-md p-4 rounded-3xl border border-brand-light/50 shadow-sm gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="text-5xl filter drop-shadow-sm select-none"
          >
            🌸
          </motion.div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tight">FloraMath</h1>
        </motion.div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-brand-light rounded-3xl p-8 mb-12 text-center shadow-sm relative overflow-hidden"
      >
        {/* <Sparkles className="absolute top-4 right-4 text-brand-primary opacity-50" size={32} /> */}
        <motion.p
          key={quote ?? "default"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-text-muted mb-6 flex justify-center gap-1 pt-4 italic"
        >
          <span className="text-brand-primary/60 text-5xl font-serif leading-none">“</span>
          <span className="font-serif">{quote}</span>
          <span className="text-brand-primary/60 text-5xl font-serif leading-none self-end">”</span>
        </motion.p>
        <BouncyButton id="progress-link-btn" variant="primary" onClick={() => router.push("/admin")}>
          View My Progress
        </BouncyButton>
      </motion.div>

      {/* Modules Grid */}
      <div className="w-full flex flex-col items-center md:items-start">
        <div className="bg-surface px-6 py-3 rounded-2xl border border-brand-light/50 shadow-sm mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-brand-accent" /> Start a Challenge
          </h3>
        </div>

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
                <SoftCard data-testid={`module-card-${mod.slug}`} className="h-full flex flex-col justify-between relative !bg-brand-light border-brand-light/60">
                  {/* Gear config button — top-right corner */}
                  <motion.button
                    data-testid={`module-config-btn-${mod.slug}`}
                    whileHover={{ rotate: 90, scale: 1.1, color: "#FFB6C1" }}
                    whileTap={{ scale: 0.95, rotate: -45 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    onClick={() => setConfigSlug(mod.slug)}
                    className="absolute top-1 right-1 w-14 h-14 flex items-center justify-center rounded-full text-text-muted transition-colors"
                    title="Configure quiz"
                  >
                    <Settings size={22} />
                  </motion.button>

                  <div className="pr-12">
                    <h4 id="quiz-card-title" className="text-xl font-bold text-brand-accent mb-2">{mod.title}</h4>
                    <p className="text-text-muted text-sm">{mod.desc}</p>
                  </div>

                  <div className="mt-4 flex justify-end items-center">
                    <BouncyButton
                      data-testid={`module-start-btn-${mod.slug}`}
                      variant="primary"
                      className="text-sm px-6 py-2.5 font-bold"
                      onClick={() => handlePlay(mod.slug)}
                    >
                      <span className="flex items-center gap-1.5 justify-center">
                        Start
                      </span>
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
