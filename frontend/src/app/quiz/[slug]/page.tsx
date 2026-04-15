"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizSession } from "@/hooks/useQuizSession";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { SoftCard } from "@/components/ui/SoftCard";
import { ArrowLeft } from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import { useEncouragements } from "@/hooks/useEncouragements";

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
  const [currentEncouragement, setCurrentEncouragement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load encouragement puller (handles background queueing)
  const { pullEncouragement } = useEncouragements();

  // Auto-start session using the user's saved config from the store
  useEffect(() => {
    const config = getModuleConfig(slug);
    startSession(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Show full-screen feedback on every submission
  useEffect(() => {
    if (!feedback) return;
    if (!feedback.isCorrect) {
      setCurrentEncouragement(pullEncouragement());
    }
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
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-7xl filter drop-shadow-md select-none"
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
                className="flex-1 font-bold py-4"
                onClick={() => startSession(getModuleConfig(slug))}
              >
                <span className="flex items-center gap-1.5 justify-center">
                  Start Again <span className="text-xl filter drop-shadow-[0_0_1px_rgba(255,182,193,0.5)]"></span>
                </span>
              </BouncyButton>
            </div>
          </SoftCard>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ STATE ─────────────────────────────────────────────────────────────
  return (
    <main id="quiz-page" data-quiz-slug={slug} className="min-h-screen flex flex-col items-center justify-start p-3 pt-4 max-w-lg mx-auto">

      {/* ── Unified Game Card ── */}
      <motion.div
        className="w-full bg-brand-light rounded-3xl shadow-xl shadow-brand-primary/10 border border-brand-primary/20 overflow-hidden"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        {/* ── Card Header: back + progress + score ── */}
        <div className="bg-brand-light/40 px-4 py-3 flex items-center gap-3 border-b border-brand-light/50">
          <button
            id="quiz-back-btn"
            onClick={() => router.push("/")}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-text-muted hover:text-brand-primary transition rounded-full hover:bg-white/70"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Progress bar track */}
          <div id="quiz-progress-bar-track" className="flex-1 bg-white/70 rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div
              id="quiz-progress-bar"
              className="h-full bg-brand-primary rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Progress pill */}
          <motion.div
            id="quiz-progress-counter"
            key={questionIndex}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.25 }}
            className="shrink-0 flex items-center gap-1 bg-white/80 border border-brand-primary/15 px-3 py-1 rounded-full shadow-sm"
          >
            <span className="text-xs font-extrabold text-brand-primary tabular-nums">{questionIndex - 1}</span>
            <span className="text-xs font-bold text-text-muted">/</span>
            <span className="text-xs font-bold text-text-muted tabular-nums">{totalQuestions}</span>
          </motion.div>
        </div>

        {/* ── Question + Answer form body ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.04, rotate: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="px-5 pt-6 pb-5"
          >
            {/* Label */}
            <p className="text-text-muted text-xs font-semibold tracking-widest uppercase text-center opacity-60 mb-3">
              What is
            </p>

            {/* Question */}
            <h2
              id="quiz-question-text"
              className="text-4xl font-extrabold text-brand-accent text-center mb-6 tabular-nums"
            >
              {currentQuestion}
            </h2>

            {/* Form */}
            <form id="quiz-answer-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                id="quiz-answer-input"
                ref={inputRef}
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full text-center text-3xl font-bold bg-white/90 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-inset focus:ring-brand-primary/20 text-brand-primary border border-brand-light transition-all placeholder:text-brand-light/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="?"
                autoFocus
                readOnly={showFeedback}
              />
              <BouncyButton
                id="quiz-submit-btn"
                type="submit"
                variant="primary"
                className="w-full text-lg py-4 rounded-2xl"
                disabled={showFeedback || !answer.trim()}
              >
                Submit
              </BouncyButton>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
            transition={{ duration: 0.2 }}
            onClick={dismissFeedback}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 cursor-pointer backdrop-blur-md ${
              feedback.isCorrect
                ? "bg-green-50/90"
                : "bg-red-50/90"
            }`}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: feedback.isCorrect ? 0 : -5 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                boxShadow: feedback.isCorrect 
                  ? "0 0 60px 10px rgba(134, 239, 172, 0.2)" 
                  : "0 0 60px 10px rgba(252, 165, 165, 0.2)"
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center max-w-md p-10 rounded-[3rem] bg-white shadow-2xl relative overflow-hidden border border-brand-light/20"
            >
              {/* Decorative background glow */}
              <div className={`absolute inset-0 opacity-5 ${feedback.isCorrect ? "bg-green-300" : "bg-red-300"}`} />

              {/* Title */}
              <h2 className={`text-5xl font-extrabold tracking-tight mb-8 relative z-10 ${
                feedback.isCorrect ? "text-green-600/70" : "text-brand-accent"
              }`}>
                {feedback.isCorrect ? "Yay! 🌸" : "Oops! 💔"}
              </h2>

              {/* Question recap & answer */}
              <div className="bg-brand-light/20 px-10 py-8 rounded-[2.5rem] border-2 border-white/80 mb-4 inline-block relative z-10 shadow-inner">
                 <p className="text-4xl font-extrabold text-brand-primary tabular-nums">
                  {feedback.questionText} ={" "}
                  <span className={`${
                    feedback.isCorrect ? "text-green-600/70" : "text-brand-accent"
                  }`}>
                    {feedback.correctAnswer}
                  </span>
                 </p>
              </div>

              {!feedback.isCorrect && (
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-lg font-bold text-red-400 mt-4 relative z-10"
                >
                  {currentEncouragement}
                </motion.p>
              )}

              {/* Tap hint */}
              <p className="text-xs font-bold text-text-muted mt-10 animate-bounce uppercase tracking-widest opacity-50 relative z-10">Tap to continue</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
