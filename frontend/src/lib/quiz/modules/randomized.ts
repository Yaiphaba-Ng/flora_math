import { BaseQuizModule, Question } from "../base_module";
import { MultiplicationModule } from "./multiplication";
import { PowersModule } from "./powers";
import { AdditionSubtractionModule } from "./addition_subtraction";
import { useConfigStore } from "@/store/useConfigStore";

export class RandomizedModule extends BaseQuizModule {
  slug = "randomized";
  title = "Randomized Mix";
  description = "A surprise mix of questions from all categories. Keeps your brain on its toes!";

  generateQuestions(config: Record<string, any>, weakSpots?: string[]): Question[] {
    const totalTarget = Math.max(1, Number(config.num_questions ?? 20));
    const allConfigs = useConfigStore.getState().configs;

    // 1. Setup pillars
    const pillars = [
      { 
        module: new MultiplicationModule(),
        config: allConfigs["multiplication"] || {}
      },
      { 
        module: new PowersModule(),
        config: { ...(allConfigs["powers"] || {}), mode: 'mixed' }
      },
      { 
        module: new AdditionSubtractionModule(),
        // We might need more than the average if we are heavily picking weak spots from here
        config: { ...(allConfigs["addition_subtraction"] || {}), num_questions: totalTarget } 
      }
    ];

    // 2. Generate individual pools and separate into weak vs normal
    const prioritySet = new Set(weakSpots || []);
    
    const pillarPools = pillars.map(p => {
      const generated = p.module.generateQuestions(p.config);
      
      const weak: Question[] = [];
      const normal: Question[] = [];
      
      for (const q of generated) {
        if (prioritySet.has(q.question_string)) {
          weak.push(q);
        } else {
          normal.push(q);
        }
      }
      
      // Shuffle both
      [weak, normal].forEach(list => {
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
      });

      return { weak, normal, weakIdx: 0, normalIdx: 0 };
    });

    const finalQuestions: Question[] = [];
    let pickedCount = 0;

    // 3. Phase 1: Try to fill up to 50% of the quiz with weak spots using round-robin across pillars
    const maxWeakSpots = Math.floor(totalTarget * 0.5);
    let weakRounds = 0;
    while (pickedCount < maxWeakSpots && weakRounds < 100) { // Safety break
      let pickedInRound = 0;
      for (const p of pillarPools) {
        if (pickedCount < maxWeakSpots && p.weakIdx < p.weak.length) {
          finalQuestions.push(p.weak[p.weakIdx]);
          p.weakIdx++;
          pickedCount++;
          pickedInRound++;
        }
      }
      if (pickedInRound === 0) break;
      weakRounds++;
    }

    // 4. Phase 2: Fill the rest with normal questions (and any remaining weak spots) 
    // using round-robin to maintain balance
    let safetyRounds = 0;
    while (pickedCount < totalTarget && safetyRounds < 500) {
      let pickedInRound = 0;
      for (const p of pillarPools) {
        if (pickedCount < totalTarget) {
          if (p.normalIdx < p.normal.length) {
            finalQuestions.push(p.normal[p.normalIdx]);
            p.normalIdx++;
            pickedCount++;
            pickedInRound++;
          } else if (p.weakIdx < p.weak.length) {
            // If we ran out of normal for a category, use its leftover weak ones
            finalQuestions.push(p.weak[p.weakIdx]);
            p.weakIdx++;
            pickedCount++;
            pickedInRound++;
          }
        }
      }
      if (pickedInRound === 0) break;
      safetyRounds++;
    }

    // 5. Final shuffle so the categories and weak spots are distributed
    for (let i = finalQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
    }

    return finalQuestions;
  }

  evaluateAnswer(question: Question, userAnswer: any): boolean {
    const parsed = parseInt(String(userAnswer), 10);
    if (isNaN(parsed)) return false;
    return parsed === question.correct_answer;
  }
}
