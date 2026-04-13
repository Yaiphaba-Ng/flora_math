"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "flora_quote_cache";

interface QuoteCache {
  quote: string;
  fetchedAt: number;
}

interface UseQuoteResult {
  quote: string | null;
  isFirstLoad: boolean; // true only when localStorage is empty (no backup ever saved)
}

async function fetchQuoteFromApi(): Promise<string> {
  const res = await fetch("/api/llm/quote");
  const data = await res.json();
  return data.quote as string;
}

export function useQuoteOfDay(): UseQuoteResult {
  const [quote, setQuote] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    // 1. Read from localStorage immediately (synchronous — zero latency)
    let cached: QuoteCache | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    if (cached?.quote) {
      // We have a backup quote — display it instantly
      setQuote(cached.quote);

      // Then silently fetch a fresh one in the background for NEXT visit
      fetchQuoteFromApi()
        .then((fresh) => {
          if (fresh && fresh !== cached!.quote) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ quote: fresh, fetchedAt: Date.now() }));
          }
        })
        .catch(() => {/* keep existing cache on failure */});
    } else {
      // No cache at all — first ever visit — must wait for API response
      setIsFirstLoad(true);
      fetchQuoteFromApi()
        .then((fresh) => {
          setQuote(fresh);
          setIsFirstLoad(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ quote: fresh, fetchedAt: Date.now() }));
        })
        .catch(() => {
          setQuote("You are capable of incredible things. Keep learning!");
          setIsFirstLoad(false);
        });
    }
  }, []);

  return { quote, isFirstLoad };
}
