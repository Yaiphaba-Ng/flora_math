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
    const totalTarget = Number(config.num_questions ?? 20);
    // We generate a larger pool so useQuizSession can still prioritize weak spots 
    // while maintaining a balanced distribution in the underlying set.
    const poolSize = Math.max(100, totalTarget * 3);
    
    // 1. Setup pillars with their specific sub-configs
    const allConfigs = useConfigStore.getState().configs;
    
    const pillars = [
      { 
        slug: 'multiplication',
        module: new MultiplicationModule(),
        config: allConfigs["multiplication"] || {}
      },
      { 
        slug: 'powers',
        module: new PowersModule(),
        config: { ...(allConfigs["powers"] || {}), mode: 'mixed' }
      },
      { 
        slug: 'addition_subtraction',
        module: new AdditionSubtractionModule(),
        config: { ...(allConfigs["addition_subtraction"] || {}), num_questions: poolSize } 
      }
    ];

    // 2. Generate and shuffle individual pools
    const pillarPools = pillars.map(p => {
      const pool = p.module.generateQuestions(p.config);
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool;
    });

    // 3. Balanced sampling (Round-Robin) into the large pool
    const poolQuestions: Question[] = [];
    const poolIndices = pillarPools.map(() => 0);
    let totalPicked = 0;

    while (totalPicked < poolSize) {
      let pickedInThisRound = 0;
      for (let i = 0; i < pillarPools.length; i++) {
        if (totalPicked < poolSize && poolIndices[i] < pillarPools[i].length) {
          poolQuestions.push(pillarPools[i][poolIndices[i]]);
          poolIndices[i]++;
          totalPicked++;
          pickedInThisRound++;
        }
      }
      if (pickedInThisRound === 0) break;
    }

    // 4. Final shuffle
    // Even though we shuffle the big pool, the statistical distribution 
    // remains balanced across categories.
    for (let i = poolQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolQuestions[i], poolQuestions[j]] = [poolQuestions[j], poolQuestions[i]];
    }

    return poolQuestions;
  }

  evaluateAnswer(question: Question, userAnswer: any): boolean {
    const parsed = parseInt(String(userAnswer), 10);
    if (isNaN(parsed)) return false;
    return parsed === question.correct_answer;
  }
}
