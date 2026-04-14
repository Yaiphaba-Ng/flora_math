import { BaseQuizModule, Question } from "../base_module";

export class SquaresModule extends BaseQuizModule {
  slug = "squares";
  title = "Square Numbers";
  description = "Learn and practice your squares from memory.";

  getConfigSchema() {
    return [
      {
        key: "range_start",
        label: "Start Range",
        type: "stepper" as const,
        min: 1,
        max: 50,
        default: 1,
      },
      {
        key: "range_end",
        label: "End Range",
        type: "stepper" as const,
        min: 5,
        max: 100,
        default: 20,
      },
    ];
  }

  generateQuestions(config: Record<string, any>): Question[] {
    const rangeStart = Number(config.range_start ?? 1);
    const rangeEnd = Number(config.range_end ?? 20);
    const questions: Question[] = [];
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      questions.push({
        question_string: `${i}²`,
        correct_answer: i * i,
      });
    }
    
    // Shuffle
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    return questions;
  }

  evaluateAnswer(question: Question, userAnswer: any): boolean {
    const parsed = parseInt(String(userAnswer), 10);
    if (isNaN(parsed)) return false;
    return parsed === question.correct_answer;
  }
}
