export interface Question {
  question_string: string;
  correct_answer: any;
}

export abstract class BaseQuizModule {
  abstract slug: string;
  abstract title: string;
  abstract description: string;

  /**
   * Given a dict/record of custom configs, return a list of questions.
   * Optionally takes a list of performance-based "weak spots" to influence sampling.
   */
  abstract generateQuestions(config: Record<string, any>, weakSpots?: string[]): Question[];

  /**
   * Evaluate a single answer for a question
   */
  abstract evaluateAnswer(question: Question, userAnswer: any): boolean;
}
