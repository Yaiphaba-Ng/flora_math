import { BaseQuizModule } from "./base_module";
import { MultiplicationModule } from "./modules/multiplication";
import { PowersModule } from "./modules/powers";
import { RandomizedModule } from "./modules/randomized";
import { AdditionSubtractionModule } from "./modules/addition_subtraction";

const modules: BaseQuizModule[] = [
  new MultiplicationModule(),
  new PowersModule(),
  new RandomizedModule(),
  new AdditionSubtractionModule(),
];

export const getModules = () => modules;

export const getModuleBySlug = (slug: string): BaseQuizModule | undefined => {
  return modules.find(m => m.slug === slug);
};
