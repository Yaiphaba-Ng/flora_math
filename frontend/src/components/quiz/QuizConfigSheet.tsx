"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Play } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
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
          return (
            <motion.span key={i} layout className="text-brand-primary font-extrabold text-base mx-0.5 tabular-nums">
              {String(draft[match[1]] ?? "?")}
            </motion.span>
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

  return (
    <div data-testid={`config-stepper-${field.key}`} className="bg-brand-light/30 rounded-2xl p-3 flex flex-col gap-2">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center leading-tight">
        {field.label}
      </p>
      <div className="flex items-center justify-center gap-3">
        <motion.button
          data-testid={`config-stepper-down-${field.key}`}
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(clamp(value - 1))}
          className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition"
        >
          <ChevronDown size={20} />
        </motion.button>
        <input
          data-testid={`config-stepper-input-${field.key}`}
          type="number"
          min={field.min ?? 1}
          value={value}
          onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onChange(clamp(v)); }}
          className="w-16 text-center text-2xl font-extrabold text-brand-primary bg-transparent border-b-2 border-brand-primary outline-none tabular-nums py-0.5
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <motion.button
          data-testid={`config-stepper-up-${field.key}`}
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(clamp(value + 1))}
          className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition"
        >
          <ChevronUp size={20} />
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
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const displayValue = Math.min(value, max);

  return (
    <div data-testid={`config-slider-${field.key}`} className="px-5 mb-3">
      <div className="bg-brand-light/30 rounded-2xl px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{field.label}</p>
          <input
            data-testid={`config-slider-input-${field.key}`}
            type="number"
            min={min}
            max={max}
            value={displayValue}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onChange(clamp(v)); }}
            className="w-14 text-center text-sm font-extrabold text-brand-primary bg-brand-light/60 border-2 border-brand-light rounded-xl py-1 outline-none focus:border-brand-primary transition
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <input
          data-testid={`config-slider-range-${field.key}`}
          type="range"
          min={min}
          max={max}
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-pink-400 bg-brand-light"
        />
        <div className="flex justify-between text-[10px] text-text-muted tabular-nums">
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
                <span id="config-sheet-title" className="font-extrabold text-brand-primary">{schema.title}</span>
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
              <div id="config-sheet-preview" className="mx-5 mb-3 px-4 py-2.5 bg-brand-light/40 rounded-2xl">
                <LiveSentence template={schema.sentenceTemplate} draft={draft} />
              </div>

              {/* First two number fields side-by-side */}
              {pairFields.length > 0 && (
                <div className={`px-5 grid gap-3 mb-3 ${pairFields.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {pairFields.map((field) => (
                    <NumberStepper
                      key={field.key}
                      field={field}
                      value={Number(draft[field.key] ?? field.defaultValue)}
                      onChange={(v) => updateField(field.key, v)}
                    />
                  ))}
                </div>
              )}

              {/* Remaining number fields — centered, half-width */}
              {extraFields.length > 0 && (
                <div className="px-5 flex justify-center mb-3">
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
                </div>
              )}

              {/* Slider fields — dynamic max for num_questions */}
              {sliderFields.map((field) => (
                <SliderField
                  key={field.key}
                  field={field}
                  value={Number(draft[field.key] ?? field.defaultValue)}
                  dynamicMax={field.key === "num_questions" ? maxQuestions : undefined}
                  onChange={(v) => updateField(field.key, v)}
                />
              ))}

              {/* Toggle fields */}
              {toggleFields.length > 0 && (
                <div className="mx-5 mb-3 flex flex-col gap-2">
                  {toggleFields.map((field) => (
                    <button
                      key={field.key}
                      onClick={() => updateField(field.key, !draft[field.key])}
                      className="flex items-center justify-between bg-brand-light/30 rounded-2xl px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-text-main">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">{draft[field.key] ? "On" : "Off"}</span>
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${draft[field.key] ? "bg-brand-primary" : "bg-brand-light"}`}>
                          <motion.span
                            animate={{ x: draft[field.key] ? 20 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm block"
                          />
                        </div>
                      </div>
                    </button>
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
                onClick={handlePlay}
                className="w-full bg-brand-primary text-white font-extrabold text-lg rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md shadow-brand-primary/30"
              >
                <Play size={20} fill="white" /> 
                <span className="flex items-center gap-1.5">
                  Start Quiz <span className="text-xl filter drop-shadow-[0_0_1px_rgba(255,182,193,0.5)]">🌸</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
