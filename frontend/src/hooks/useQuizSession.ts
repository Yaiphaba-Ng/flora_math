import { fetcher } from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";

interface StartSessionResponse {
  session_id: number;
  total: number;
  first_question: string;
}

interface AnswerResponse {
  is_correct: boolean;
  is_finished: boolean;
  next_question: string | null;
  score: number;
  correct_answer: string | null; // always returned; non-null lets UI show it on wrong answers
}

// Feedback is a snapshot per submission — using a counter ensures the same
// result (e.g. two correct in a row) still re-fires the feedback animation.
export interface AnswerFeedback {
  id: number;           // monotonically increasing, used as useEffect dependency
  isCorrect: boolean;
  correctAnswer: string | null;
  questionText: string; // the question that was just answered
}

export function useQuizSession(moduleSlug: string) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const feedbackCounter = useRef(0);
  const questionStartTime = useRef<number>(Date.now());
  const pendingNextState = useRef<{ isFinished: boolean; nextQuestion: string | null } | null>(null);

  const startMutation = useMutation({
    mutationFn: (config: Record<string, unknown>) =>
      fetcher<StartSessionResponse>("/quiz/start", {
        method: "POST",
        body: JSON.stringify({ user_id: 1, module_slug: moduleSlug, config }),
      }),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setTotalQuestions(data.total);
      setQuestionIndex(1);
      setScore(0);
      setIsFinished(false);
      setFeedback(null);
      pendingNextState.current = null;
      questionStartTime.current = Date.now();
    },
  });

  const answerMutation = useMutation({
    mutationFn: (userAnswer: string) => {
      const timeTaken = Date.now() - questionStartTime.current;
      return fetcher<AnswerResponse>("/quiz/answer", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          question_string: currentQuestion,
          user_answer: userAnswer,
          time_taken_ms: timeTaken,
        }),
      });
    },
    onSuccess: (data) => {
      feedbackCounter.current += 1;
      setFeedback({
        id: feedbackCounter.current,
        isCorrect: data.is_correct,
        correctAnswer: data.correct_answer,
        questionText: currentQuestion ?? "",
      });
      setScore(data.score);

      pendingNextState.current = {
        isFinished: data.is_finished,
        nextQuestion: data.next_question,
      };
    },
  });

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

  return {
    sessionId,
    currentQuestion,
    questionIndex,
    totalQuestions,
    score,
    isFinished,
    feedback,
    startSession: startMutation.mutate,
    isStarting: startMutation.isPending,
    submitAnswer: answerMutation.mutate,
    isSubmitting: answerMutation.isPending,
    advanceToNext,
  };
}
