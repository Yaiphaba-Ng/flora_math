"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/apiClient";
import { SoftCard } from "@/components/ui/SoftCard";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Zap, CheckCircle, XCircle, Eye, EyeOff, RefreshCw, Quote, MessageSquare, Trash2 } from "lucide-react";

type LLMProvider = "gemini" | "groq";

const PROVIDER_META: Record<LLMProvider, { label: string; icon: string; desc: string }> = {
  gemini: { label: "Google Gemini", icon: "✨", desc: "Creative & warm. Best for nuanced quotes." },
  groq: { label: "Groq", icon: "⚡", desc: "Ultra-fast LPU inference. Great for snappy responses." },
};

interface SettingsData {
  provider: LLMProvider;
  model: string;
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
  promptQuote: string;
  promptEncouragement: string;
}

interface TestResult { success: boolean; message: string; }

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: current, isLoading } = useQuery<SettingsData>({
    queryKey: ["settings", "llm"],
    queryFn: () => fetcher("/settings/llm"),
  });

  const [provider, setProvider] = useState<LLMProvider>("gemini");
  const [model, setModel] = useState<string>("");
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [promptQuote, setPromptQuote] = useState("");
  const [promptEncouragement, setPromptEncouragement] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);

  const [models, setModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/metrics/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      alert("All quiz history and performance data cleared! ✨");
    },
    onError: (err) => {
      alert("Failed to reset data: " + err.message);
    }
  });

  useEffect(() => {
    if (current) {
      setProvider(current.provider);
      setModel(current.model);
      setPromptQuote(current.promptQuote);
      setPromptEncouragement(current.promptEncouragement);
    }
  }, [current]);

  // Reset models and test result when provider changes
  useEffect(() => {
    setModels([]);
    setModel("");
    setTestResult(null);
    setModelsError(null);
  }, [provider]);

  // Reset test result when model changes
  useEffect(() => {
    setTestResult(null);
  }, [model]);

  const activeKey = provider === "gemini" ? geminiKey : groqKey;

  const fetchModels = async () => {
    const hasExistingKey = provider === "gemini" ? current?.hasGeminiKey : current?.hasGroqKey;
    if (!activeKey && !hasExistingKey) {
      setModelsError("Enter your API key first to fetch available models.");
      return;
    }
    setIsFetchingModels(true);
    setModelsError(null);
    setModels([]);
    try {
      const res = await fetch("/api/settings/llm/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, api_key: activeKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setModels(data.models ?? []);
      if (data.models?.length > 0 && !model) setModel(data.models[0]);
    } catch (e: any) {
      setModelsError(e.message ?? "Failed to fetch models.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTest = async () => {
    if (!model) return;
    const hasExistingKey = provider === "gemini" ? current?.hasGeminiKey : current?.hasGroqKey;
    if (!activeKey && !hasExistingKey) {
      setTestResult({ success: false, message: "No API key available to test." });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, api_key: activeKey }),
      });
      const data: TestResult = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: "Request failed. Check your network." });
    } finally {
      setIsTesting(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          gemini_api_key: geminiKey,
          groq_api_key: groqKey,
          promptQuote,
          promptEncouragement
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "llm"] });
      setSaveSuccess(true);
      setGeminiKey("");
      setGroqKey("");
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="bg-brand-primary p-2.5 rounded-xl text-white shadow-sm">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-primary">LLM Settings</h1>
          <p className="text-text-muted text-sm mt-0.5">Configure the AI provider for quotes and encouragements</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-brand-light animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* ── Provider ─────────────────────────────────────── */}
          <SoftCard>
            <h2 className="text-base font-bold text-text-main mb-4">Active Provider</h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PROVIDER_META) as LLMProvider[]).map((p) => {
                const meta = PROVIDER_META[p];
                const isActive = provider === p;
                return (
                  <button key={p} onClick={() => setProvider(p)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${isActive
                      ? "border-brand-primary bg-brand-light/50 shadow-sm"
                      : "border-brand-light hover:border-brand-primary/30 bg-white"}`}
                  >
                    <span className="text-xl mb-1">{meta.icon}</span>
                    <span className={`font-extrabold text-sm ${isActive ? "text-brand-primary" : "text-text-main"}`}>{meta.label}</span>
                    <span className="text-xs text-text-muted mt-0.5 leading-snug">{meta.desc}</span>
                  </button>
                );
              })}
            </div>
          </SoftCard>

          {/* ── API Keys ─────────────────────────────────────── */}
          <SoftCard>
            <h2 className="text-base font-bold text-text-main mb-4">API Keys</h2>
            <div className="flex flex-col gap-4">
              {/* Gemini Key */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  ✨ Gemini API Key {current?.hasGeminiKey && <span className="text-green-500 font-bold normal-case">· saved ✓</span>}
                </label>
                <div className="relative">
                  <input type={showGeminiKey ? "text" : "password"} value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    placeholder={current?.hasGeminiKey ? "•••••• (key saved)" : "Paste Gemini API key"}
                    className="w-full bg-brand-light/40 border border-brand-light rounded-xl px-4 py-3 pr-12 text-sm font-mono text-text-main outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
                  />
                  <button type="button" onClick={() => setShowGeminiKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-primary transition">
                    {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Groq Key */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  ⚡ Groq API Key {current?.hasGroqKey && <span className="text-green-500 font-bold normal-case">· saved ✓</span>}
                </label>
                <div className="relative">
                  <input type={showGroqKey ? "text" : "password"} value={groqKey}
                    onChange={e => setGroqKey(e.target.value)}
                    placeholder={current?.hasGroqKey ? "•••••• (key saved)" : "Paste Groq API key"}
                    className="w-full bg-brand-light/40 border border-brand-light rounded-xl px-4 py-3 pr-12 text-sm font-mono text-text-main outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
                  />
                  <button type="button" onClick={() => setShowGroqKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-primary transition">
                    {showGroqKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </SoftCard>

          {/* ── Model Selection ───────────────────────────────── */}
          <SoftCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">Model</h2>
              <button onClick={fetchModels} disabled={isFetchingModels}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-accent border border-brand-accent/40 px-3 py-1.5 rounded-lg hover:bg-brand-accent/10 transition disabled:opacity-50">
                <motion.div animate={isFetchingModels ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ repeat: isFetchingModels ? Infinity : 0, duration: 1, ease: "linear" }}>
                  <RefreshCw size={13} />
                </motion.div>
                {isFetchingModels ? "Fetching…" : "Fetch Models"}
              </button>
            </div>

            {modelsError && <p className="text-xs text-red-400 mb-3 font-mono">{modelsError}</p>}

            {models.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {models.map(m => (
                  <button key={m} onClick={() => setModel(m)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left ${model === m
                      ? "border-brand-primary bg-brand-light/40 text-brand-primary"
                      : "border-brand-light text-text-main hover:border-brand-primary/40"}`}
                  >
                    <span className="text-sm font-bold font-mono">{m}</span>
                    {model === m && <CheckCircle size={15} className="text-brand-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-text-muted text-sm">
                {current?.model ? (
                  <p>Currently using <span className="font-bold font-mono text-brand-primary">{current.model}</span>.<br />
                    <span className="text-xs">Enter your API key above and click "Fetch Models" to see available options.</span>
                  </p>
                ) : (
                  <p>Enter your API key and click "Fetch Models".</p>
                )}
              </div>
            )}

            {/* Test Connection */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-light">
              <button onClick={handleTest} disabled={isTesting || !model}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-accent text-brand-accent font-bold text-sm hover:bg-brand-accent hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed">
                {isTesting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full" />
                ) : <Zap size={16} />}
                Test Connection
              </button>

              <AnimatePresence>
                {testResult && (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className={`flex items-center gap-1.5 text-sm font-bold ${testResult.success ? "text-green-600" : "text-red-500"}`}>
                    {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {testResult.success ? "Connected!" : "Failed"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {testResult && !testResult.success && (
              <p className="text-xs text-red-400 mt-2 font-mono">{testResult.message}</p>
            )}
          </SoftCard>

          {/* ── Custom Prompts ───────────────────────────────── */}
          <SoftCard>
            <h2 className="text-base font-bold text-text-main mb-4">Prompt Configuration</h2>
            <div className="flex flex-col gap-6">
              {/* Quote Prompt */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Quote size={14} className="text-brand-primary" /> Quote Generation Prompt
                </label>
                <textarea
                  id="settings-prompt-quote"
                  value={promptQuote}
                  onChange={e => setPromptQuote(e.target.value)}
                  rows={3}
                  className="w-full bg-brand-light/40 border border-brand-light rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/30 transition resize-none"
                  placeholder="Enter custom prompt for quote generation..."
                />
              </div>

              {/* Encouragement Prompt */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <MessageSquare size={14} className="text-brand-primary" /> Encouragement Prompt
                </label>
                <textarea
                  id="settings-prompt-encouragement"
                  value={promptEncouragement}
                  onChange={e => setPromptEncouragement(e.target.value)}
                  rows={6}
                  className="w-full bg-brand-light/40 border border-brand-light rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/30 transition resize-none font-mono"
                  placeholder="Enter custom prompt for encouragement messages..."
                />
                <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                  💡 <strong>Tip:</strong> Ensure your encouragement prompt instructs the AI to return a JSON array of strings for proper app functioning.
                </p>
              </div>
            </div>
          </SoftCard>

          {/* ── Save ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <BouncyButton id="settings-save-btn" variant="primary"
              onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Saving…" : saveSuccess ? "Saved! ✓" : "Save Settings"}
            </BouncyButton>
            {saveMutation.isError && (
              <p className="text-xs text-red-500 text-center font-bold">Failed to save. Check your connection.</p>
            )}
            <p className="text-xs text-text-muted text-center">
              Changes take effect on the next quote/encouragement request. Clear your local browser cache to force an immediate refresh.
            </p>
          </div>

          {/* ── Dangerous Zone ────────────────────────────────── */}
          <div className="mt-12 pt-8 border-t border-red-100 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">Danger Zone</h2>
              <p className="text-[10px] text-text-muted font-medium">Permanent actions for development and debugging</p>
            </div>
            
            <button
              id="settings-reset-btn"
              onClick={() => {
                if (confirm("Are you sure you want to clear all quiz history? This cannot be undone! 💔")) {
                  resetMutation.mutate();
                }
              }}
              disabled={resetMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition disabled:opacity-50 shadow-sm"
            >
              <Trash2 size={16} />
              {resetMutation.isPending ? "Clearing Data..." : "Reset All Performance Data"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
