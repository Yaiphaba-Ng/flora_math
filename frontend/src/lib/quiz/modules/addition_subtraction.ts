import { BaseQuizModule, Question } from "../base_module";

export class AdditionSubtractionModule extends BaseQuizModule {
  slug = "addition_subtraction";
  title = "Addition & Subtraction";
  description = "Master mental math with customizable addition and subtraction challenges.";

  generateQuestions(config: Record<string, any>, _weakSpots?: string[]): Question[] {
    const digits = Number(config.digits ?? 2);
    const allowNegative = Boolean(config.allow_negative ?? false);
    const numQuestions = Number(config.num_questions ?? 20);
    
    const questions: Question[] = [];
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    for (let i = 0; i < numQuestions; i++) {
      const isAddition = Math.random() > 0.5;
      const a = Math.floor(Math.random() * (max - min + 1)) + min;
      const b = Math.floor(Math.random() * (max - min + 1)) + min;
      
      let question_string = "";
      let correct_answer = 0;

      if (isAddition) {
        question_string = `${a} + ${b}`;
        correct_answer = a + b;
      } else {
        // Subtraction
        if (!allowNegative && a < b) {
          // Swap to avoid negative answer if not allowed
          question_string = `${b} - ${a}`;
          correct_answer = b - a;
        } else {
          question_string = `${a} - ${b}`;
          correct_answer = a - b;
        }
      }

      questions.push({
        question_string,
        correct_answer,
      });
    }

    return questions;
  }

  evaluateAnswer(question: Question, userAnswer: any): boolean {
    const parsed = parseInt(String(userAnswer), 10);
    if (isNaN(parsed)) return false;
    return parsed === question.correct_answer;
  }
}
