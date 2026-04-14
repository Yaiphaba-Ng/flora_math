import { BaseQuizModule } from "./base_module";
import { MultiplicationModule } from "./modules/multiplication";
import { SquaresModule } from "./modules/squares";
import { CubesModule } from "./modules/cubes";
import { AdditionSubtractionModule } from "./modules/addition_subtraction";

const modules: BaseQuizModule[] = [
  new MultiplicationModule(),
  new SquaresModule(),
  new CubesModule(),
  new AdditionSubtractionModule(),
];

export const getModules = () => modules;

export const getModuleBySlug = (slug: string): BaseQuizModule | undefined => {
  return modules.find(m => m.slug === slug);
};
