import { BaseQuizModule, Question } from "../base_module";

export class CubesModule extends BaseQuizModule {
  slug = "cubes";
  title = "Cubes";
  description = "Take it to the next level with cubes (n³).";

  generateQuestions(config: Record<string, any>): Question[] {
    const rangeStart = Number(config.range_start ?? 1);
    const rangeEnd = Number(config.range_end ?? 12);
    const questions: Question[] = [];
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      questions.push({
        question_string: `${i}³`,
        correct_answer: i * i * i,
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
