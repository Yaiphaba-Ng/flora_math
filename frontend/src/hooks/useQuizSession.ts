import { useState, useRef } from "react";
import { getModuleBySlug } from "@/lib/quiz/registry";
import { Question } from "@/lib/quiz/base_module";

export interface AnswerFeedback {
  id: number;
  isCorrect: boolean;
  correctAnswer: string | null;
  questionText: string;
}

interface MetricPayload {
  question_string: string;
  is_correct: boolean;
  response_time_ms: number;
}

export function useQuizSession(moduleSlug: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const configRef = useRef<Record<string, unknown> | null>(null);
  const metricsRef = useRef<MetricPayload[]>([]);
  const feedbackCounter = useRef(0);
  const questionStartTime = useRef<number>(Date.now());
  const pendingNextState = useRef<{ isFinished: boolean; nextQuestion: Question | null } | null>(null);

  const startSession = (config: Record<string, unknown>) => {
    setIsStarting(true);
    configRef.current = config;
    try {
      const module = getModuleBySlug(moduleSlug);
      if (!module) throw new Error("Module not found");

      let generated = module.generateQuestions(config);
      const num_questions = Number(config.num_questions ?? 20);
      generated = generated.slice(0, Math.max(1, num_questions));

      if (generated.length === 0) throw new Error("No questions generated");

      setQuestions(generated);
      setCurrentQuestion(generated[0]);
      setQuestionIndex(1);
      setScore(0);
      setIsFinished(false);
      setFeedback(null);
      metricsRef.current = [];
      pendingNextState.current = null;
      questionStartTime.current = Date.now();
    } catch (e) {
      console.error("Failed to start session:", e);
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = (userAnswer: string) => {
    if (!currentQuestion || isFinished) return;
    setIsSubmitting(true);
    const timeTaken = Date.now() - questionStartTime.current;

    const module = getModuleBySlug(moduleSlug);
    if (!module) return;

    const isCorrect = module.evaluateAnswer(currentQuestion, userAnswer);
    const nextScore = isCorrect ? score + 1 : score;
    
    // Save metric
    metricsRef.current.push({
      question_string: currentQuestion.question_string,
      is_correct: isCorrect,
      response_time_ms: timeTaken
    });

    feedbackCounter.current += 1;
    setFeedback({
      id: feedbackCounter.current,
      isCorrect: isCorrect,
      correctAnswer: String(currentQuestion.correct_answer),
      questionText: currentQuestion.question_string,
    });
    setScore(nextScore);

    const nextIndex = questionIndex; // actually the 0-based index of the next question
    const willFinish = nextIndex >= questions.length;

    pendingNextState.current = {
      isFinished: willFinish,
      nextQuestion: willFinish ? null : questions[nextIndex],
    };

    // If this completes the quiz, asynchronously fire the sync payload
    if (willFinish) {
      const payload = {
        module_slug: moduleSlug,
        config: configRef.current,
        score: nextScore,
        total_questions: questions.length,
        metrics: metricsRef.current
      };
      // Fire and forget
      fetch("/api/quiz/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Sync failed:", err));
    }
    
    setIsSubmitting(false);
  };

  const advanceToNext = () => {
    if (pendingNextState.current) {
      if (pendingNextState.current.isFinished) {
        setIsFinished(true);
      } else if (pendingNextState.current.nextQuestion) {
        setCurrentQuestion(pendingNextState.current.nextQuestion);
        setQuestionIndex((i) => i + 1);
      }
      pendingNextState.current = null;
    }
    questionStartTime.current = Date.now();
  };

  // We expose standard variables aligned to legacy formats
  return {
    sessionId: 1, // dummy for UX if needed
    currentQuestion: currentQuestion?.question_string || null,
    questionIndex,
    totalQuestions: questions.length,
    score,
    isFinished,
    feedback,
    startSession,
    isStarting,
    submitAnswer,
    isSubmitting,
    advanceToNext,
  };
}
