import { BaseQuizModule, Question } from "../base_module";

export class PowersModule extends BaseQuizModule {
  slug = "powers";
  title = "Squares & Cubes";
  description = "Learn and practice your squares (n²) and cubes (n³) from memory.";

  generateQuestions(config: Record<string, any>): Question[] {
    const rangeStart = Number(config.range_start ?? 1);
    const rangeEnd = Number(config.range_end ?? 20);
    const mode = config.mode || "squares";
    
    const questions: Question[] = [];
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (mode === "cubes") {
        questions.push({
          question_string: `${i}³`,
          correct_answer: i * i * i,
        });
      } else if (mode === "squares") {
        questions.push({
          question_string: `${i}²`,
          correct_answer: i * i,
        });
      } else if (mode === "mixed") {
        questions.push({
          question_string: `${i}²`,
          correct_answer: i * i,
        });
        questions.push({
          question_string: `${i}³`,
          correct_answer: i * i * i,
        });
      }
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
