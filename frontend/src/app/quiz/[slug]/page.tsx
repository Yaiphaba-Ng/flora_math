"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizSession } from "@/hooks/useQuizSession";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { SoftCard } from "@/components/ui/SoftCard";
import { ArrowLeft, Trophy } from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { getModuleConfig } = useConfigStore();
  const {
    currentQuestion, questionIndex, totalQuestions,
    score, isFinished, feedback,
    startSession, isStarting, submitAnswer,
    advanceToNext,
  } = useQuizSession(slug);

  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-start session using the user's saved config from the store
  useEffect(() => {
    const config = getModuleConfig(slug);
    startSession(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Show full-screen feedback on every submission
  useEffect(() => {
    if (!feedback) return;
    setShowFeedback(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback?.id]);

  // Dismiss feedback — reset timer only now so feedback display time isn't counted
  const dismissFeedback = useCallback(() => {
    setShowFeedback(false);
    advanceToNext();
  }, [advanceToNext]);

  // Keep input focused when returning to the question
  useEffect(() => {
    if (!showFeedback && inputRef.current && currentQuestion) {
      inputRef.current.focus();
    }
  }, [showFeedback, currentQuestion]);

  // Auto-dismiss correct feedback after a short pause
  useEffect(() => {
    if (!showFeedback || !feedback) return;
    const delay = feedback.isCorrect ? 250 : 1500;
    const t = setTimeout(dismissFeedback, delay);
    return () => clearTimeout(t);
  }, [showFeedback, feedback, dismissFeedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    submitAnswer(answer.trim());
    setAnswer("");
  };

  const progressPct = totalQuestions > 0 ? Math.round((questionIndex / totalQuestions) * 100) : 0;

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (isStarting || (!currentQuestion && !isFinished)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-5xl"
        >
          🌸
        </motion.div>
      </div>
    );
  }

  // ── FINISHED STATE ─────────────────────────────────────────────────────────
  if (isFinished) {
    const pct = Math.round((score / totalQuestions) * 100);
    return (
      <div id="quiz-results-screen" className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <SoftCard className="text-center flex flex-col items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <h2 className="text-3xl font-extrabold text-brand-primary">You did it!</h2>
            <p className="text-text-muted text-lg">You are absolutely amazing 💕</p>

            <div id="quiz-score-display" className="bg-brand-light rounded-2xl px-8 py-4 flex flex-col items-center">
              <span className="text-5xl font-extrabold text-brand-primary">{pct}%</span>
              <span className="text-text-muted text-sm mt-1">{score} / {totalQuestions} correct</span>
            </div>

            <div className="flex gap-3 w-full">
              <BouncyButton id="quiz-home-btn" variant="secondary" className="flex-1" onClick={() => router.push("/")}>
                Home
              </BouncyButton>
              <BouncyButton
                id="quiz-replay-btn"
                variant="primary"
                className="flex-1"
                onClick={() => startSession(getModuleConfig(slug))}
              >
                Play Again 🌸
              </BouncyButton>
            </div>
          </SoftCard>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ STATE ─────────────────────────────────────────────────────────────
  return (
    <main id="quiz-page" data-quiz-slug={slug} className="min-h-screen p-8 flex flex-col items-center max-w-lg mx-auto gap-8 relative">

      {/* Back + Progress */}
      <header className="w-full flex items-center gap-4">
        <button id="quiz-back-btn" onClick={() => router.push("/")} className="p-2 text-text-muted hover:text-brand-primary transition">
          <ArrowLeft size={20} />
        </button>
        <div id="quiz-progress-bar-track" className="flex-1 bg-brand-light rounded-full h-3 overflow-hidden">
          <motion.div
            id="quiz-progress-bar"
            className="h-full bg-brand-primary rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span id="quiz-progress-counter" className="text-sm font-bold text-brand-primary whitespace-nowrap">
          {questionIndex - 1} / {totalQuestions}
        </span>
      </header>

      {/* Score pill */}
      <div id="quiz-score-pill" className="flex items-center gap-2 bg-brand-light px-4 py-2 rounded-full shadow-sm">
        <Trophy size={16} className="text-brand-accent" />
        <span className="text-sm font-bold text-brand-primary">Score: {score}</span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full"
        >
          <SoftCard className="text-center">
            <p className="text-text-muted text-sm mb-4 font-medium tracking-wide uppercase">What is</p>
            <h2 id="quiz-question-text" className="text-5xl font-extrabold text-brand-primary mb-8">{currentQuestion} = ?</h2>

            <form id="quiz-answer-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                id="quiz-answer-input"
                ref={inputRef}
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full text-center text-3xl font-bold bg-brand-light/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-brand-primary/30 text-text-main border border-brand-light"
                placeholder="?"
                autoFocus
                readOnly={showFeedback}
              />
              <BouncyButton
                id="quiz-submit-btn"
                type="submit"
                variant="primary"
                className="w-full text-lg"
                disabled={showFeedback || !answer.trim()}
              >
                Submit
              </BouncyButton>
            </form>
          </SoftCard>
        </motion.div>
      </AnimatePresence>

      {/* ── Full-screen feedback overlay ── */}
      <AnimatePresence>
        {showFeedback && feedback && (
          <motion.div
            id="quiz-feedback-overlay"
            data-correct={feedback.isCorrect}
            key={feedback.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={dismissFeedback}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 cursor-pointer ${
              feedback.isCorrect
                ? "bg-green-50/95 backdrop-blur-sm"
                : "bg-red-50/95 backdrop-blur-sm"
            }`}
          >
            <motion.div
              initial={{ scale: 0.6, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center max-w-md"
            >
              {/* Title */}
              <h2 className={`text-5xl font-extrabold tracking-tight mb-8 ${
                feedback.isCorrect ? "text-green-500" : "text-brand-accent"
              }`}>
                {feedback.isCorrect ? "Correct! 🌸" : "Not quite! 💔"}
              </h2>

              {/* Question recap & answer */}
              <div className="bg-white/70 px-8 py-6 rounded-3xl shadow-sm border border-white/50 mb-2 inline-block">
                 <p className="text-4xl font-extrabold text-brand-primary">
                  {feedback.questionText} ={" "}
                  <span className={`${
                    feedback.isCorrect ? "text-green-500" : "text-brand-accent"
                  }`}>
                    {feedback.correctAnswer}
                  </span>
                 </p>
              </div>

              {!feedback.isCorrect && (
                <p className="text-base text-text-main font-semibold mt-4">
                  The correct answer is <span className="text-brand-accent font-extrabold">{feedback.correctAnswer}</span>
                </p>
              )}

              {/* Tap hint */}
              <p className="text-xs text-text-muted mt-8 animate-pulse">Tap anywhere to continue</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
