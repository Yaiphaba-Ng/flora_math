import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MODULE_CONFIG_SCHEMAS, getDefaultConfig } from "@/config/moduleConfigs";

// Stores user-customized config per module, persisted to localStorage.
type ConfigMap = Record<string, Record<string, unknown>>;

interface ConfigState {
  configs: ConfigMap;
  setModuleConfig: (slug: string, config: Record<string, unknown>) => void;
  getModuleConfig: (slug: string) => Record<string, unknown>;
  resetModuleConfig: (slug: string) => void;
}

// Build initial defaults from schema
const buildDefaults = (): ConfigMap => {
  const defaults: ConfigMap = {};
  for (const schema of MODULE_CONFIG_SCHEMAS) {
    defaults[schema.slug] = getDefaultConfig(schema.slug);
  }
  return defaults;
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      configs: buildDefaults(),

      setModuleConfig: (slug, config) =>
        set((state) => ({
          configs: { ...state.configs, [slug]: config },
        })),

      getModuleConfig: (slug) =>
        get().configs[slug] ?? getDefaultConfig(slug),

      resetModuleConfig: (slug) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [slug]: getDefaultConfig(slug),
          },
        })),
    }),
    { name: "FloraMath-configs" }
  )
);
