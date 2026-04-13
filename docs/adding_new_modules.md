# 🧩 How to Add a New Quiz Module

FloraMath utilizes a heavily abstracted "Module Registry" system. 
This means you can easily add an entirely new quiz category (like "Fractions" or "Cubes") natively to the Next.js app in exactly 3 steps, without touching any React UI files or database tables!

---

### Step 1: Create the Module Class File
Create a new `.ts` file inside `src/lib/quiz/modules/`.
For example, `addition.ts`:

```typescript
import { BaseQuizModule, Question } from "../base_module";

export class AdditionModule extends BaseQuizModule {
  slug = "addition";
  title = "Addition Mastery";
  description = "Practice adding large numbers in your head.";

  // DEFINE YOUR UI CONFIG SLIDERS HERE
  getConfigSchema() {
    return [
      {
        key: "max_number",
        label: "Maximum Number Target",
        type: "slider" as const,
        min: 10,
        max: 500,
        default: 50,
      },
      // You can add as many config sliders here as you want
    ];
  }

  // GENERATE THE QUESTIONS
  generateQuestions(config: Record<string, unknown>): Question[] {
    const max_number = Number(config.max_number ?? 50);
    const questions: Question[] = [];

    // Loop to build questions natively 
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * max_number) + 1;
        const y = Math.floor(Math.random() * max_number) + 1;
        
        questions.push({
            question_string: `${x} + ${y}`,
            correct_answer: x + y
        });
    }

    return questions;
  }

  // EVALUATE THE ANSWER
  evaluateAnswer(question: Question, userAnswer: string | number): boolean {
    return Number(question.correct_answer) === Number(userAnswer);
  }
}
```

### Step 2: Register the Module in the Registry
Now that the logic exists, you just need to tell the global app where to find it.
Open `src/lib/quiz/registry.ts` and add your class to the array:

```typescript
import { BaseQuizModule } from "./base_module";
import { MultiplicationModule } from "./modules/multiplication";
import { AdditionModule } from "./modules/addition"; // <-- Import it

const modules: BaseQuizModule[] = [
  new MultiplicationModule(),
  new AdditionModule(), // <-- Instantiate it here
];

export const getModules = () => modules;
export const getModuleBySlug = (slug: string): BaseQuizModule | undefined => {
  return modules.find(m => m.slug === slug);
};
```

### 🎉 Step 3: You are done!
Literally, that's it. 
Because FloraMath dynamically renders UI based on the abstract registry, the very next time you open the app:
1. The **Homepage** will automatically draw a new pink card titled "Addition Mastery".
2. The **Config Sheet** popup will automatically render an interactive HTML slider for `max_number` ranging from 10 to 500.
3. The **Database** will automatically ingest metrics for `module_slug: "addition"`.
4. The **Quiz Engine** will instantly pipe your randomized questions into the view safely.
