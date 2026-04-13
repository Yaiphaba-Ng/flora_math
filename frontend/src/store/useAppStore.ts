import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'app-storage',
    }
  )
);
