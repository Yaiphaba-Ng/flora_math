"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "flora_encouragements_cache";
const BACKGROUND_REFRESH_DELAY_MS = 4000; // Wait before background refresh to avoid rate-limit collisions

const FALLBACK_PHRASES = [
  "Keep going!",
  "You've got this!",
  "Try again!",
  "Almost there!",
  "Stay strong!",
];

interface EncouragementsCache {
  phrases: string[];
  fetchedAt: number;
}

interface UseEncouragementsResult {
  phrases: string[];
}

async function fetchPhrasesFromApi(): Promise<string[]> {
  const res = await fetch("/api/llm/encouragement");
  const data = await res.json();
  if (Array.isArray(data?.phrases) && data.phrases.length > 0) {
    return data.phrases;
  }
  return FALLBACK_PHRASES;
}

function saveToCache(phrases: string[]) {
  try {
    const payload: EncouragementsCache = { phrases, fetchedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadFromCache(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached: EncouragementsCache = JSON.parse(raw);
    if (Array.isArray(cached?.phrases) && cached.phrases.length > 0) {
      return cached.phrases;
    }
  } catch {}
  return null;
}

export function useEncouragements(): UseEncouragementsResult {
  const [phrases, setPhrases] = useState<string[]>(FALLBACK_PHRASES);

  useEffect(() => {
    const cached = loadFromCache();

    if (cached) {
      // Serve cached phrases instantly
      setPhrases(cached);

      // After a delay, silently refresh for the NEXT quiz session
      const timer = setTimeout(() => {
        fetchPhrasesFromApi()
          .then((fresh) => {
            saveToCache(fresh);
            // Update in-memory too so current session gets variety if it runs long
            setPhrases(fresh);
          })
          .catch(() => {/* keep current cached phrases on failure */});
      }, BACKGROUND_REFRESH_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      // No cache — first ever visit — fetch immediately with no delay
      fetchPhrasesFromApi()
        .then((fresh) => {
          saveToCache(fresh);
          setPhrases(fresh);
        })
        .catch(() => {
          // Fallback already set as initial state
        });
    }
  }, []);

  return { phrases };
}
