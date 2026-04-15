import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Global store to manage the "Bespoke" loading overlay across page transitions.
 * This ensures that as soon as a user clicks "Start", the loader appears 
 * instantaneously while the next page is being prepared/fetched in the background.
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
