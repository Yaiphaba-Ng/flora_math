"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import { BouncyButton } from "@/components/ui/BouncyButton";

interface QuizWrapperProps {
  sessionId: string;
  firstQuestion: string;
}

export function QuizWrapper({ sessionId, firstQuestion }: QuizWrapperProps) {
  const { playPop, playBoop } = useAudio();
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [answer, setAnswer] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) return;

    setIsAnimating(true);
    
    // Fake validation loop until backend hook is injected
    // Logic: if answer == "42" (dummy), success
    if (answer === "42") {
      playPop();
    } else {
      playBoop();
    }

    setTimeout(() => {
        setIsAnimating(false);
        setAnswer("");
        // In real app, we fetch next question here via useMutation -> apiClient
    }, 800);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <AnimatePresence mode="wait">
        {!isAnimating ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full"
          >
            <div className="bg-surface rounded-3xl p-10 text-center shadow-lg border border-brand-light mb-8">
              <h2 className="text-4xl font-extrabold text-brand-primary mb-4">{currentQuestion}</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-brand-light/30 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-brand-light text-text-main"
                  placeholder="?"
                  autoFocus
                />
                <BouncyButton type="submit" variant="primary" className="w-full mt-4">
                  Submit Answer
                </BouncyButton>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-2xl font-bold text-brand-accent text-center h-48 flex items-center justify-center"
          >
            <SparklesText text="Checking..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesText({ text }: { text: string }) {
    return <span>✨ {text} ✨</span>;
}
