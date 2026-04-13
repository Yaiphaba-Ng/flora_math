"use client";

import { useAppStore } from '@/store/useAppStore';
import { useCallback } from 'react';

export function useAudio() {
  const soundEnabled = useAppStore((state) => state.soundEnabled);

  const playPop = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio('/sounds/correct-pop.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
        // Ignore if audio file is missing or browser blocked autoplay
    });
  }, [soundEnabled]);

  const playBoop = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio('/sounds/incorrect-boop.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  return { playPop, playBoop };
}
