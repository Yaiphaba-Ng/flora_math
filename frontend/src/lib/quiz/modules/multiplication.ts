import { BaseQuizModule, Question } from "../base_module";

export class MultiplicationModule extends BaseQuizModule {
  slug = "multiplication";
  title = "Multiplication Tables";
  description = "Master your times tables with configurable ranges.";

  generateQuestions(config: Record<string, any>): Question[] {
    const rangeStart = Number(config.range_start ?? 2);
    const rangeEnd = Number(config.range_end ?? 12);
    const length = Number(config.length ?? 10);
    
    const easyNums = new Set([0, 1, 10, 11]);
    const questions: Question[] = [];
    
    for (let tableNum = rangeStart; tableNum <= rangeEnd; tableNum++) {
      if (easyNums.has(tableNum)) continue;
      for (let multiplier = 1; multiplier <= length; multiplier++) {
        if (easyNums.has(multiplier)) continue;
        questions.push({
          question_string: `${tableNum} x ${multiplier}`,
          correct_answer: tableNum * multiplier,
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
