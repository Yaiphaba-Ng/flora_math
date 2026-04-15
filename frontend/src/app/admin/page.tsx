"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { Brain, Activity, Clock, Target, ArrowLeft, Filter, AlertCircle, Zap, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

interface WeakSpotError {
  question: string;
  attempts: number;
  failures: number;
  accuracy: number;
  avg_time_sec: number;
}

interface HesitationSpot {
  question: string;
  attempts: number;
  avg_time_sec: number;
}

interface WeakSpotsPayload {
  top_errors: WeakSpotError[];
  slowest_correct: HesitationSpot[];
}

interface Session {
  id: number;
  module_slug: string;
  score: number;
  total_questions: number;
  accuracy: number;
  created_at: string;
}

interface GlobalStats {
  totalSessions: number;
  totalQuestions: number;
  globalAccuracy: number;
  avgResponseTimeSec: number;
}

interface ModuleInfo {
  slug: string;
  title: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE BRIDGE: "Always Display Something" strategy ---
  const [persistedData, setPersistedData] = useState<Record<string, any>>({});

  // On mount, load everything from localStorage for instant "stale" display
  useEffect(() => {
    const keys = ["admin-overview-all", "admin-weak-spots-all", "admin-recent-sessions-all"];
    const loaded: Record<string, any> = {};
    keys.forEach(k => {
      try {
        const val = localStorage.getItem(k);
        if (val) loaded[k] = JSON.parse(val);
      } catch (e) {}
    });
    setPersistedData(loaded);
  }, []);

  const { data: modules } = useQuery<ModuleInfo[]>({
    queryKey: ["modules"],
    queryFn: () => fetcher("/quiz/modules")
  });

  // Overview Stats
  const { data: stats, isFetching: isFetchingStats } = useQuery<GlobalStats>({
    queryKey: ["admin", "overview", selectedModule],
    queryFn: () => fetcher(`/admin/metrics/overview?module=${selectedModule}`),
    placeholderData: (prev) => prev || persistedData[`admin-overview-${selectedModule}`] || persistedData[`admin-overview-all`],
    staleTime: 10000, // 10s quiet revalidation
    refetchOnMount: "always",
  });

  // Weak Spots
  const { data: weakSpots, isFetching: isFetchingWeakSpots } = useQuery<WeakSpotsPayload>({
    queryKey: ["admin", "weak-spots", selectedModule],
    queryFn: () => fetcher(`/admin/metrics/weak-spots?module=${selectedModule}`),
    placeholderData: (prev) => prev || persistedData[`admin-weak-spots-${selectedModule}`] || persistedData[`admin-weak-spots-all`],
    staleTime: 15000,
    refetchOnMount: "always",
  });

  // Sessions
  const { data: sessions, isFetching: isFetchingSessions } = useQuery<Session[]>({
    queryKey: ["admin", "recent-sessions", selectedModule],
    queryFn: () => fetcher(`/admin/sessions/recent?module=${selectedModule}`),
    placeholderData: (prev) => prev || persistedData[`admin-recent-sessions-${selectedModule}`] || persistedData[`admin-recent-sessions-all`],
    staleTime: 10000,
    refetchOnMount: "always",
  });

  // Persist "all" data as a global fallback whenever it updates
  useEffect(() => {
    if (stats && selectedModule === "all") localStorage.setItem("admin-overview-all", JSON.stringify(stats));
  }, [stats, selectedModule]);

  useEffect(() => {
    if (weakSpots && selectedModule === "all") localStorage.setItem("admin-weak-spots-all", JSON.stringify(weakSpots));
  }, [weakSpots, selectedModule]);

  useEffect(() => {
    if (sessions && selectedModule === "all") localStorage.setItem("admin-recent-sessions-all", JSON.stringify(sessions));
  }, [sessions, selectedModule]);

  // Derived loading states: only show pulse if we have NO data at all (not even placeholder)
  const hasStats = !!stats;
  const hasWeakSpots = !!weakSpots;
  const hasSessions = !!sessions;

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Top Header Row */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 md:mb-6">
        <header className="flex-1 flex items-center gap-3 md:gap-4 bg-[#FFF9FB]/80 backdrop-blur-md p-4 rounded-3xl border border-brand-light/50 shadow-sm relative overflow-hidden">
          {/* Subtle "updating" indicator */}
          {(isFetchingStats || isFetchingSessions || isFetchingWeakSpots) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute bottom-0 left-0 h-0.5 bg-brand-primary/30"
              style={{ width: "100%" }}
            >
              <motion.div 
                className="h-full bg-brand-primary"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ width: "30%" }}
              />
            </motion.div>
          )}
          
          <button id="admin-back-btn" onClick={() => router.push("/")} className="p-2 flex-shrink-0 text-text-muted hover:text-brand-primary transition rounded-full hover:bg-brand-light">
            <ArrowLeft size={24} />
          </button>
          <div className="bg-brand-accent p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm text-white flex-shrink-0">
            <Activity className={`w-6 h-6 md:w-8 md:h-8 ${(isFetchingStats || isFetchingSessions || isFetchingWeakSpots) ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-primary leading-tight">Progress Dashboard</h1>
            <p className="text-text-muted text-xs sm:text-sm md:text-base mt-0.5 line-clamp-1">A magical look into her beautiful brain 🧠</p>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Filter Dropdown */}
          <div className="w-full sm:w-auto relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center bg-brand-light/40 border border-brand-light hover:border-brand-accent p-2 md:p-2.5 rounded-xl shadow-sm transition-all text-left"
            >
              <Filter size={18} className="text-brand-accent mx-2 flex-shrink-0" />
              <span className="bg-transparent text-sm sm:text-base font-bold text-text-main flex-1 md:w-48 truncate">
                {selectedModule === "all" ? "Every Topic" : modules?.find(m => m.slug === selectedModule)?.title || "Select Topic"}
              </span>
              <ChevronDown 
                size={18} 
                className={`text-brand-primary transform transition-transform duration-200 mx-2 ${isDropdownOpen ? "rotate-180" : ""}`} 
              />
            </button>
          
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-full md:w-64 bg-white border border-brand-light rounded-xl shadow-xl overflow-hidden z-20"
                >
                  <div className="flex flex-col py-1">
                    <button
                      onClick={() => {
                        setSelectedModule("all");
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-brand-light/30 transition-colors text-left ${selectedModule === "all" ? "bg-brand-light/20" : ""}`}
                    >
                      <span className={`text-sm font-bold ${selectedModule === "all" ? "text-brand-primary" : "text-text-main"}`}>Every Topic</span>
                      {selectedModule === "all" && <Check size={16} className="text-brand-primary" />}
                    </button>
                    {modules?.map((m) => (
                      <button
                        key={m.slug}
                        onClick={() => {
                          setSelectedModule(m.slug);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-brand-light/30 transition-colors text-left border-t border-brand-light/50 ${selectedModule === m.slug ? "bg-brand-light/20" : ""}`}
                      >
                        <span className={`text-sm font-bold ${selectedModule === m.slug ? "text-brand-primary" : "text-text-main"}`}>{m.title}</span>
                        {selectedModule === m.slug && <Check size={16} className="text-brand-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global Hero Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 w-full">
        <SoftCard className="flex flex-col items-center justify-center p-4 md:py-6 text-center">
          <span className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={14}/> Accuracy</span>
          {!hasStats ? <div className="h-8 md:h-10 w-16 bg-brand-light animate-pulse rounded-lg mt-1" /> : (
            <span className={`text-2xl md:text-4xl font-extrabold text-brand-primary ${isFetchingStats ? 'opacity-50' : ''}`}>{stats?.globalAccuracy}%</span>
          )}
        </SoftCard>
        <SoftCard className="flex flex-col items-center justify-center p-4 md:py-6 text-center">
          <span className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={14}/> Speed</span>
          {!hasStats ? <div className="h-8 md:h-10 w-16 bg-brand-light animate-pulse rounded-lg mt-1" /> : (
            <span className={`text-2xl md:text-4xl font-extrabold text-brand-accent ${isFetchingStats ? 'opacity-50' : ''}`}>{stats?.avgResponseTimeSec}s</span>
          )}
        </SoftCard>
        <SoftCard className="flex flex-col items-center justify-center p-4 md:py-6 text-center">
          <span className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Brain size={14}/> Sessions</span>
          {!hasStats ? <div className="h-8 md:h-10 w-12 bg-brand-light animate-pulse rounded-lg mt-1" /> : (
            <span className={`text-2xl md:text-4xl font-extrabold text-text-strong ${isFetchingStats ? 'opacity-50' : ''}`}>{stats?.totalSessions}</span>
          )}
        </SoftCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* High Error Rate Widget */}
        <SoftCard className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-text-main">
            <AlertCircle size={20} className="text-brand-primary" /> High Error Rate
          </h2>
          
          <div className={`flex flex-col gap-3 ${isFetchingWeakSpots ? 'opacity-60' : ''}`}>
            {!hasWeakSpots ? (
               <div className="animate-pulse flex h-32 bg-brand-light/50 rounded-xl"></div>
            ) : (stats?.totalSessions ?? 0) === 0 ? (
               <p className="text-text-muted text-center py-8 font-medium">No sessions recorded yet. Time to start! 🌸</p>
            ) : !weakSpots?.top_errors?.length ? (
               <p className="text-text-muted text-center py-8 font-medium">Perfect accuracy! No errors found. 🎉</p>
            ) : (
               weakSpots.top_errors.map((spot, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-brand-light/30 rounded-xl border border-brand-light">
                   <div className="flex gap-4 items-center">
                      <span className="bg-brand-primary text-white font-bold px-3 py-1 rounded-full text-sm">
                        {spot.question}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-text-main font-bold">
                          {spot.accuracy}% Accuracy
                        </span>
                        <span className="text-xs text-text-muted">
                          Failed {spot.failures} of {spot.attempts}
                        </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-sm text-brand-accent font-bold">
                     <Clock size={14} /> {spot.avg_time_sec}s
                   </div>
                 </div>
               ))
            )}
          </div>
        </SoftCard>

        {/* Hesitation Widget */}
        <SoftCard className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-text-main">
            <Zap size={20} className="text-brand-accent" /> Hesitations (Slow Correct)
          </h2>
          
          <div className={`flex flex-col gap-3 ${isFetchingWeakSpots ? 'opacity-60' : ''}`}>
            {!hasWeakSpots ? (
               <div className="animate-pulse flex h-32 bg-brand-light/50 rounded-xl"></div>
            ) : (stats?.totalSessions ?? 0) === 0 ? (
               <p className="text-text-muted text-center py-8 font-medium">No sessions recorded yet. Time to start! 🌸</p>
            ) : !weakSpots?.slowest_correct?.length ? (
               <p className="text-text-muted text-center py-8 font-medium">No hesitation detected. You are fast! ⚡</p>
            ) : (
               weakSpots.slowest_correct.map((spot, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-brand-light/30 rounded-xl border border-brand-light">
                   <div className="flex gap-4 items-center">
                      <span className="bg-brand-accent text-white font-bold px-3 py-1 rounded-full text-sm">
                        {spot.question}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-text-main font-bold">
                          100% Accuracy
                        </span>
                        <span className="text-xs text-text-muted">
                          Answered {spot.attempts}x
                        </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-sm text-brand-primary font-bold">
                     <Clock size={14} /> {spot.avg_time_sec}s
                   </div>
                 </div>
               ))
            )}
          </div>
        </SoftCard>

        {/* Recent Sessions Widget */}
        <SoftCard className="flex flex-col md:col-span-2">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-text-main">
            <Brain size={20} className="text-brand-primary" /> Session History
          </h2>
          
          <div className={`flex flex-col gap-3 ${isFetchingSessions ? 'opacity-60' : ''}`}>
             {!hasSessions ? (
               <div className="animate-pulse flex h-32 bg-brand-light/50 rounded-xl"></div>
            ) : sessions?.length === 0 ? (
               <p className="text-text-muted text-center py-8">No sessions recorded yet.</p>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {sessions?.map((session) => (
                   <div key={session.id} className="flex flex-col p-4 bg-brand-light/30 rounded-xl border border-brand-light relative overflow-hidden group hover:border-brand-accent transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-text-main capitalize">{session.module_slug}</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-extrabold shadow-sm ${session.accuracy >= 80 ? 'bg-brand-primary text-white' : session.accuracy >= 50 ? 'bg-brand-accent text-white' : 'bg-gray-200 text-text-muted'}`}>
                          {session.accuracy}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-sm font-bold text-brand-primary">
                          {session.score} / {session.total_questions} <span className="font-medium text-text-muted text-xs">correct</span>
                        </span>
                        <span className="text-[10px] text-text-muted font-bold tracking-wide uppercase">
                            {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </SoftCard>
      </div>

    </main>
  );
}
