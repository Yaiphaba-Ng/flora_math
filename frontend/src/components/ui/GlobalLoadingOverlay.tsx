"use client";

import { useLoadingStore } from "@/store/useLoadingStore";
import { BespokeLoader } from "@/components/ui/BespokeLoader";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Global component that monitors the useLoadingStore.
 * It remains mounted but uses AnimatePresence to immediately 
 * show the high-quality loader on any "instant" transition.
 */
export function GlobalLoadingOverlay() {
  const { isLoading } = useLoadingStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} // Super fast fade-in for "instant" feel
          className="fixed inset-0 z-[9999] bg-surface" // Highest possible z-index
        >
          <BespokeLoader />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
