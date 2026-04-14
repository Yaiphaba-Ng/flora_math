"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "flora_encouragements_queue";
const QUEUE_TARGET_SIZE = 5;
const REPLENISH_THRESHOLD = 3;

const FALLBACK_PHRASES = [
  "Keep going! You've got this!",
  "Doing great! Try again! 🌸",
  "Almost there! You're amazing!",
  "Stay strong! You can do it!",
  "Every try makes you smarter! ✨",
];

async function fetchOnePhrase(): Promise<string> {
  try {
    const res = await fetch("/api/llm/encouragement");
    const data = await res.json();
    return data?.phrase || FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
  } catch {
    return FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
  }
}

export function useEncouragements() {
  const [queue, setQueue] = useState<string[]>([]);
  const isFetching = useRef(false);

  // Load initial queue from cache or fallbacks
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    let initial: string[] = [];
    try {
      if (raw) initial = JSON.parse(raw);
    } catch {}

    if (!Array.isArray(initial) || initial.length === 0) {
      initial = [...FALLBACK_PHRASES].sort(() => Math.random() - 0.5).slice(0, QUEUE_TARGET_SIZE);
    }
    setQueue(initial);
  }, []);

  // Save queue to cache whenever it changes
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }, [queue]);

  // Background replenishment
  const replenish = useCallback(async () => {
    if (isFetching.current || queue.length >= QUEUE_TARGET_SIZE) return;
    isFetching.current = true;
    
    try {
      const fresh = await fetchOnePhrase();
      setQueue(prev => {
        if (prev.includes(fresh)) return prev;
        const newQueue = [...prev, fresh];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
        return newQueue;
      });
    } finally {
      isFetching.current = false;
    }
  }, [queue.length]);

  // Trigger replenishment if queue is low - purely background
  useEffect(() => {
    if (queue.length < REPLENISH_THRESHOLD) {
      replenish();
    }
  }, [queue.length, replenish]);

  /**
   * Returns a phrase instantly.
   * Updates state asynchronously to avoid blocking the current render cycle.
   */
  const pullEncouragement = useCallback(() => {
    const phrase = queue[0] || FALLBACK_PHRASES[Math.floor(Math.random() * FALLBACK_PHRASES.length)];
    
    // Defer the queue update so it doesn't trigger a re-render 
    // in the middle of the component showing feedback.
    setTimeout(() => {
      setQueue(prev => prev.length > 0 ? prev.slice(1) : prev);
    }, 0);

    return phrase;
  }, [queue]);

  return { pullEncouragement };
}
