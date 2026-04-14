import { BaseQuizModule } from "./base_module";
import { MultiplicationModule } from "./modules/multiplication";
import { SquaresModule } from "./modules/squares";
import { CubesModule } from "./modules/cubes";

const modules: BaseQuizModule[] = [
  new MultiplicationModule(),
  new SquaresModule(),
  new CubesModule(),
];

export const getModules = () => modules;

export const getModuleBySlug = (slug: string): BaseQuizModule | undefined => {
  return modules.find(m => m.slug === slug);
};
