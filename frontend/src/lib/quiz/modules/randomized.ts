import { BaseQuizModule, Question } from "../base_module";
import { MultiplicationModule } from "./multiplication";
import { PowersModule } from "./powers";
import { AdditionSubtractionModule } from "./addition_subtraction";
import { useConfigStore } from "@/store/useConfigStore";

export class RandomizedModule extends BaseQuizModule {
  slug = "randomized";
  title = "Randomized Mix";
  description = "A surprise mix of questions from all categories. Keeps your brain on its toes!";

  generateQuestions(config: Record<string, any>): Question[] {
    const targetLength = Number(config.num_questions ?? 50);
    
    // Instantiate available modules to use their generation logic
    const modules = {
      multiplication: new MultiplicationModule(),
      powers: new PowersModule(),
      additionSubtraction: new AdditionSubtractionModule(),
    };

    // Pull the latest saved configurations from the global store
    const allConfigs = useConfigStore.getState().configs;
    
    const multConfig = allConfigs["multiplication"] || {};
    const powersConfig = allConfigs["powers"] || {};
    const addSubConfig = allConfigs["addition_subtraction"] || {};

    let allPossibleQuestions: Question[] = [];

    // Aggregate questions using the user's specific settings for each module
    allPossibleQuestions.push(...modules.multiplication.generateQuestions(multConfig));
    
    // For powers, we include both squares and cubes regardless of the current toggle, 
    // but we use the user's preferred range.
    allPossibleQuestions.push(...modules.powers.generateQuestions({ ...powersConfig, use_cubes: false }));
    allPossibleQuestions.push(...modules.powers.generateQuestions({ ...powersConfig, use_cubes: true }));
    
    allPossibleQuestions.push(...modules.additionSubtraction.generateQuestions(addSubConfig));

    // Shuffle the combined pool
    for (let i = allPossibleQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPossibleQuestions[i], allPossibleQuestions[j]] = [allPossibleQuestions[j], allPossibleQuestions[i]];
    }

    // Return a generous slice so the session handler can still prioritize weak spots
    return allPossibleQuestions.slice(0, Math.max(targetLength * 2, 100));
  }

  evaluateAnswer(question: Question, userAnswer: any): boolean {
    const parsed = parseInt(String(userAnswer), 10);
    if (isNaN(parsed)) return false;
    return parsed === question.correct_answer;
  }
}
