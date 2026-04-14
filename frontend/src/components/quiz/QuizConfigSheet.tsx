"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Play } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { MODULE_CONFIG_SCHEMAS, ConfigField } from "@/config/moduleConfigs";
import { useConfigStore } from "@/store/useConfigStore";

interface QuizConfigSheetProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

// Live sentence preview with pink-highlighted values
function LiveSentence({ template, draft }: { template: string; draft: Record<string, unknown> }) {
  const parts = template.split(/(\{[^}]+\})/g);
  return (
    <p className="text-sm font-semibold text-text-muted leading-relaxed text-center">
      {parts.map((part, i) => {
        const match = part.match(/^\{(.+)\}$/);
        if (match) {
          const val = String(draft[match[1]] ?? "?");
          return (
            <span 
              key={i}
              className="inline-block text-brand-primary font-extrabold text-base mx-0.5 tabular-nums"
            >
              {val}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// Compact stepper — label, ▼ number ▲
function NumberStepper({ field, value, onChange }: {
  field: ConfigField; value: number; onChange: (v: number) => void;
}) {
  const clamp = useCallback((v: number) => Math.max(field.min ?? 1, v), [field.min]);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div data-testid={`config-stepper-${field.key}`} className="bg-brand-light/30 rounded-2xl p-3 flex flex-col gap-2 border border-brand-light/20 transition-all hover:border-brand-light/50">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center leading-tight">
        {field.label}
      </p>
      <div className="flex items-center justify-center gap-3">
        <motion.button
          data-testid={`config-stepper-down-${field.key}`}
          whileHover={{ 
            scale: 1.1, 
            backgroundColor: "#ffffff",
            borderColor: "#FFB6C1",
            boxShadow: "0 10px 15px -3px rgba(255, 182, 193, 0.3)"
          }}
          whileTap={{ 
            scale: 0.85, 
            rotate: -12,
            backgroundColor: "#FFB6C1",
            color: "#ffffff"
          }}
          transition={{ type: "spring", stiffness: 600, damping: 25 }}
          onClick={() => onChange(clamp(value - 1))}
          className="w-12 h-12 shrink-0 aspect-square rounded-full bg-white border-2 border-brand-light flex items-center justify-center text-brand-primary shadow-sm transition-colors"
        >
          <ChevronDown size={22} />
        </motion.button>

        <motion.div
          key={isFocused ? "focused" : value}
          initial={isFocused ? {} : { scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <input
            data-testid={`config-stepper-input-${field.key}`}
            type="number"
            min={field.min ?? 1}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onChange(clamp(v)); }}
            className="w-16 text-center text-2xl font-extrabold text-brand-primary bg-transparent border-b-2 border-brand-primary outline-none tabular-nums py-0.5
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all focus:scale-110"
          />
        </motion.div>

        <motion.button
          data-testid={`config-stepper-up-${field.key}`}
          whileHover={{ 
            scale: 1.1, 
            backgroundColor: "#ffffff",
            borderColor: "#FFB6C1",
            boxShadow: "0 10px 15px -3px rgba(255, 182, 193, 0.3)"
          }}
          whileTap={{ 
            scale: 0.85, 
            rotate: 12,
            backgroundColor: "#FFB6C1",
            color: "#ffffff"
          }}
          transition={{ type: "spring", stiffness: 600, damping: 25 }}
          onClick={() => onChange(clamp(value + 1))}
          className="w-12 h-12 shrink-0 aspect-square rounded-full bg-white border-2 border-brand-light flex items-center justify-center text-brand-primary shadow-sm transition-colors"
        >
          <ChevronUp size={22} />
        </motion.button>
      </div>
    </div>
  );
}

// Slider + number input combo — dynamic max
function SliderField({ field, value, dynamicMax, onChange }: {
  field: ConfigField; value: number; dynamicMax?: number; onChange: (v: number) => void;
}) {
  const min = field.min ?? 1;
  const max = dynamicMax ?? field.max ?? 100;
  const isQuestions = field.key === "num_questions";
  const [isInteracting, setIsInteracting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const displayValue = Math.min(value, max);
  const percentage = max > min ? ((displayValue - min) / (max - min)) * 100 : 0;

  // Magnetic snapping: Snaps to 1, then multiples of 5, then the exact max.
  const handleSnapping = (v: number) => {
    if (!isQuestions) {
      onChange(clamp(v));
      return;
    }

    const prevMultiple = Math.floor(max / 5) * 5;
    const snapToMaxThreshold = (prevMultiple + max) / 2;

    if (v <= 2.5) {
      onChange(1);
    } else if (max !== prevMultiple && v >= snapToMaxThreshold) {
      onChange(max);
    } else {
      onChange(clamp(Math.round(v / 5) * 5));
    }
  };

  return (
    <div data-testid={`config-slider-${field.key}`} className="px-5 mb-3">
      <div className="bg-brand-light/30 rounded-2xl px-4 py-3 flex flex-col gap-2 border border-brand-light/10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{field.label}</p>
          
          <motion.div
            key={isFocused ? "focused" : displayValue}
            initial={isFocused ? {} : { scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <input
              data-testid={`config-slider-input-${field.key}`}
              type="number"
              min={min}
              max={max}
              value={displayValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) handleSnapping(v);
              }}
              className="w-14 text-center text-sm font-extrabold text-brand-primary bg-brand-light/60 border-2 border-brand-light rounded-xl py-1 outline-none focus:border-brand-primary transition
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </motion.div>
        </div>

        <div className="relative flex items-center h-8 group">
          {/* Custom Track Background */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="w-full h-2 bg-brand-light rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-brand-primary/20"
                 animate={{ width: `${percentage}%` }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
            </div>
          </div>

          {/* Custom Buttery Smooth Thumb */}
          <motion.div
            className="absolute top-1/2 w-7 h-7 rounded-full bg-brand-primary border-4 border-white shadow-lg pointer-events-none z-0"
            animate={{ 
              left: `${percentage}%`,
              scale: isInteracting ? 1.35 : 1,
              boxShadow: isInteracting 
                ? "0 10px 20px -5px rgba(255, 182, 193, 0.6)" 
                : "0 4px 6px -1px rgba(255, 182, 193, 0.3)"
            }}
            whileHover={{ scale: 1.15 }}
            transition={{ 
              left: { type: "spring", stiffness: 450, damping: 40, mass: 0.8 },
              scale: { type: "spring", stiffness: 500, damping: 20 },
              boxShadow: { duration: 0.2 }
            }}
            style={{ x: "-50%", y: "-50%" }}
          >
             {/* Core glow */}
             <div className="absolute inset-0 rounded-full bg-brand-primary shadow-[0_0_15px_rgba(255,182,193,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Invisible Real Input for Interaction */}
          <input
            data-testid={`config-slider-range-${field.key}`}
            type="range"
            min={min}
            max={max}
            step={1}
            value={displayValue}
            onMouseDown={() => setIsInteracting(true)}
            onMouseUp={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onChange={(e) => handleSnapping(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex justify-between text-[10px] text-text-muted tabular-nums font-bold">
          <span>{min}</span>
          <span>max {max}</span>
        </div>
      </div>
    </div>
  );
}

export function QuizConfigSheet({ slug, isOpen, onClose, onPlay }: QuizConfigSheetProps) {
  const schema = MODULE_CONFIG_SCHEMAS.find((s) => s.slug === slug);
  const { getModuleConfig, setModuleConfig } = useConfigStore();

  const [draft, setDraft] = useState<Record<string, unknown>>(() => getModuleConfig(slug));

  const updateField = (key: string, value: unknown) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handlePlay = () => {
    setModuleConfig(slug, draft);
    onClose();
    onPlay();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Compute max possible questions dynamically from current config
  const maxQuestions = useMemo(() => {
    if (!schema?.computeMaxQuestions) return undefined;
    return schema.computeMaxQuestions(draft);
  }, [schema, draft]);

  if (!schema) return null;

  const numberFields = schema.fields.filter((f) => f.type === "number");
  const sliderFields = schema.fields.filter((f) => f.type === "slider");
  const toggleFields = schema.fields.filter((f) => f.type === "toggle");

  // Split number fields: first two side-by-side, rest below centered
  const pairFields = numberFields.slice(0, 2);
  const extraFields = numberFields.slice(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.div
            id="config-sheet"
            key="sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl max-w-lg mx-auto max-h-[85vh] flex flex-col"
          >
            {/* ── Pinned header ── */}
            <div className="shrink-0">
              <div className="w-8 h-1 bg-brand-light rounded-full mx-auto mt-3 mb-2" />
              <div className="flex items-center justify-between px-5 py-1">
                <span id="config-sheet-title" className="font-extrabold text-brand-accent">{schema.title}</span>
                <motion.button
                  id="config-close-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  title="Close"
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-brand-light text-text-muted hover:bg-brand-accent hover:text-white transition"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
              {/* Live sentence preview */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                id="config-sheet-preview" 
                className="mx-5 mb-3 px-4 py-2.5 bg-brand-light/40 rounded-2xl"
              >
                <LiveSentence template={schema.sentenceTemplate} draft={draft} />
              </motion.div>

              {/* First two number fields side-by-side */}
              {pairFields.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`px-5 grid gap-3 mb-3 ${pairFields.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {pairFields.map((field) => (
                    <NumberStepper
                      key={field.key}
                      field={field}
                      value={Number(draft[field.key] ?? field.defaultValue)}
                      onChange={(v) => updateField(field.key, v)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Remaining number fields — centered, half-width */}
              {extraFields.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-5 flex justify-center mb-3"
                >
                  <div className="w-1/2 min-w-[180px]">
                    {extraFields.map((field) => (
                      <NumberStepper
                        key={field.key}
                        field={field}
                        value={Number(draft[field.key] ?? field.defaultValue)}
                        onChange={(v) => updateField(field.key, v)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Slider fields — dynamic max for num_questions */}
              {sliderFields.map((field, idx) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + (idx * 0.05) }}
                >
                  <SliderField
                    field={field}
                    value={Number(draft[field.key] ?? field.defaultValue)}
                    dynamicMax={field.key === "num_questions" ? maxQuestions : undefined}
                    onChange={(v) => updateField(field.key, v)}
                  />
                </motion.div>
              ))}

              {/* Toggle fields */}
              {toggleFields.length > 0 && (
                <div className="mx-5 mb-3 flex flex-col gap-2">
                  {toggleFields.map((field, idx) => (
                    <motion.button
                      key={field.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.05) }}
                      data-testid={`config-toggle-${field.key}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateField(field.key, !draft[field.key])}
                      className="flex items-center justify-between bg-brand-light/30 rounded-2xl px-4 py-3 border border-brand-light/20 transition-all hover:bg-brand-light/50"
                    >
                      <span className="text-sm font-semibold text-text-main">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-muted">{draft[field.key] ? "On" : "Off"}</span>
                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${draft[field.key] ? "bg-brand-primary shadow-lg shadow-brand-primary/30" : "bg-brand-light"}`}>
                          <motion.span
                            animate={{ 
                              x: draft[field.key] ? 24 : 4,
                              scale: draft[field.key] ? 1.1 : 1
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md block"
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Pinned footer ── */}
            <div className="shrink-0 px-5 pb-8 pt-3 bg-surface">
              <motion.button
                id="config-start-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={{ 
                  boxShadow: ["0 4px 6px -1px rgba(255,182,193,0.3)", "0 10px 15px -3px rgba(255,182,193,0.5)", "0 4px 6px -1px rgba(255,182,193,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={handlePlay}
                className="w-full bg-brand-primary text-white font-extrabold text-lg rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md"
              >
                <Play size={20} fill="white" /> 
                <span className="flex items-center gap-1.5">
                  Start Quiz <span className="text-xl">🌸</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
