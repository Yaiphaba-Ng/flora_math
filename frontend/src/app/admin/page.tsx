"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { Brain, Activity, Clock, Target } from "lucide-react";

interface WeakSpot {
  question: string;
  attempts: number;
  failures: number;
  avg_time_ms: number;
}

interface Session {
  id: number;
  module_slug: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: weakSpots, isLoading: isLoadingWeakSpots } = useQuery<WeakSpot[]>({
    queryKey: ["admin", "weak-spots"],
    queryFn: () => fetcher("/admin/metrics/weak-spots")
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ["admin", "recent-sessions"],
    queryFn: () => fetcher("/admin/sessions/recent")
  });

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <header className="flex items-center gap-3 mb-4">
        <div className="bg-brand-accent p-3 rounded-2xl shadow-sm text-white">
          <Activity size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">Progress Dashboard</h1>
          <p className="text-text-muted">A magical look into her beautiful brain 🧠</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Weak Spots Widget */}
        <SoftCard className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-text-main">
            <Target size={20} className="text-brand-primary" /> The "Weak Spot" Matrix
          </h2>
          
          <div className="flex flex-col gap-3">
            {isLoadingWeakSpots ? (
               <div className="animate-pulse flex h-32 bg-brand-light/50 rounded-xl"></div>
            ) : weakSpots?.length === 0 ? (
               <p className="text-text-muted text-center py-8">No data recorded yet. Time to play!</p>
            ) : (
               weakSpots?.map((spot, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-brand-light/30 rounded-xl border border-brand-light">
                   <div className="flex gap-4 items-center">
                      <span className="bg-brand-primary text-white font-bold px-3 py-1 rounded-full text-sm">
                        {spot.question}
                      </span>
                      <span className="text-sm text-text-muted font-medium">
                        Failed {spot.failures}x
                      </span>
                   </div>
                   <div className="flex items-center gap-1 text-sm text-brand-accent font-bold">
                     <Clock size={14} /> {spot.avg_time_ms}ms
                   </div>
                 </div>
               ))
            )}
          </div>
        </SoftCard>

        {/* Recent Sessions Widget */}
        <SoftCard className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-text-main">
            <Brain size={20} className="text-brand-primary" /> Session History
          </h2>
          
          <div className="flex flex-col gap-3">
             {isLoadingSessions ? (
               <div className="animate-pulse flex h-32 bg-brand-light/50 rounded-xl"></div>
            ) : sessions?.length === 0 ? (
               <p className="text-text-muted text-center py-8">No sessions recorded yet.</p>
            ) : (
               sessions?.map((session) => (
                 <div key={session.id} className="flex flex-col p-4 bg-brand-light/30 rounded-xl border border-brand-light relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-brand-primary capitalize">{session.module_slug}</span>
                      <span className="bg-white text-brand-accent px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {session.score}/{session.total_questions}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                        {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                    </span>
                 </div>
               ))
            )}
          </div>
        </SoftCard>
      </div>

    </main>
  );
}
