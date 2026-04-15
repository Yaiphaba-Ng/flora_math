// Central schema definition for every quiz module's configurable fields.
// When adding a new module, just add an entry here — the QuizConfigSheet
// renders it automatically without any UI code changes.

export type FieldType = "number" | "slider" | "toggle" | "select";

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  min?: number;         // soft floor for validation only — no arbitrary upper cap
  max?: number;         // only set when the field uses a slider (type: "slider")
  defaultValue: string | number | boolean;
  options?: { label: string; value: string | number | boolean }[]; // For select type
  toggleLabels?: { on: string; off: string }; // For boolean toggles
  hint?: string;
}

export interface ModuleConfigSchema {
  slug: string;
  title: string;
  emoji: string;
  sentenceTemplate: string;
  fields: ConfigField[];
  // Returns the maximum possible questions given the current config values.
  // Used to dynamically cap the num_questions slider.
  computeMaxQuestions?: (config: Record<string, unknown>) => number;
}

// Shared num_questions field appended to every module.
const numQuestionsField: ConfigField = {
  key: "num_questions",
  label: "Number of questions",
  type: "slider",
  min: 1,
  max: 100,  // fallback max — overridden at runtime by computeMaxQuestions
  defaultValue: 20,
};

export const MODULE_CONFIG_SCHEMAS: ModuleConfigSchema[] = [
  {
    slug: "multiplication",
    title: "Multiplication Tables",
    emoji: "✖️",
    sentenceTemplate: "Quiz me on the tables of {range_start} to {range_end}, each upto {length}",
    computeMaxQuestions: (cfg) => {
      const start = Number(cfg.range_start ?? 10);
      const end = Number(cfg.range_end ?? 20);
      const len = Number(cfg.length ?? 10);
      
      const easyNums = new Set([0, 1, 10, 11]);
      let validTables = 0;
      for (let i = start; i <= end; i++) {
        if (!easyNums.has(i)) validTables++;
      }
      
      let validMultipliers = 0;
      for (let i = 1; i <= len; i++) {
        if (!easyNums.has(i)) validMultipliers++;
      }
      
      return Math.max(1, validTables * validMultipliers);
    },
    fields: [
      {
        key: "range_start",
        label: "Starting table",
        type: "number",
        min: 1,
        defaultValue: 10,
      },
      {
        key: "range_end",
        label: "Ending table",
        type: "number",
        min: 1,
        defaultValue: 20,
      },
      {
        key: "length",
        label: "Times up to (×N)",
        type: "number",
        min: 1,
        defaultValue: 10,
      },
      numQuestionsField,
    ],
  },
  {
    slug: "powers",
    title: "Squares & Cubes",
    emoji: "🔢",
    sentenceTemplate: "Quiz me on {mode} of numbers from {range_start} to {range_end}",
    computeMaxQuestions: (cfg) => {
      const start = Number(cfg.range_start ?? 1);
      const end = Number(cfg.range_end ?? 20);
      return Math.max(1, Math.abs(end - start) + 1);
    },
    fields: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        defaultValue: "squares",
        options: [
          { label: "Squares", value: "squares" },
          { label: "Cubes", value: "cubes" },
          { label: "Squares & Cubes", value: "mixed" },
        ],
      },
      {
        key: "range_start",
        label: "Start from",
        type: "number",
        min: 1,
        defaultValue: 1,
      },
      {
        key: "range_end",
        label: "Up to",
        type: "number",
        min: 1,
        defaultValue: 20,
      },
      numQuestionsField,
    ],
  },
  {
    slug: "addition_subtraction",
    title: "Addition & Subtraction",
    emoji: "➕",
    sentenceTemplate: "Quiz me on {digits}-digit addition & subtraction",
    // No hard cap — questions are randomly generated, effectively unlimited
    fields: [
      {
        key: "digits",
        label: "Digit complexity",
        type: "number",
        min: 1,
        defaultValue: 2,
      },
      {
        key: "allow_negative",
        label: "Allow negative answers",
        type: "toggle",
        defaultValue: false,
      },
      numQuestionsField,
    ],
  },
  {
    slug: "randomized",
    title: "Randomized Mix",
    emoji: "🎲",
    sentenceTemplate: "Surprise me with {num_questions} questions from across the entire curriculum",
    fields: [
      numQuestionsField,
    ],
  },
];

// Helper: generate a default config object from a schema
export function getDefaultConfig(slug: string): Record<string, unknown> {
  const schema = MODULE_CONFIG_SCHEMAS.find((s) => s.slug === slug);
  if (!schema) return {};
  return Object.fromEntries(schema.fields.map((f) => [f.key, f.defaultValue]));
}
