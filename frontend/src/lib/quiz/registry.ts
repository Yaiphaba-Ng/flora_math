import { BaseQuizModule } from "./base_module";
import { MultiplicationModule } from "./modules/multiplication";

const modules: BaseQuizModule[] = [
  new MultiplicationModule(),
];

export const getModules = () => modules;

export const getModuleBySlug = (slug: string): BaseQuizModule | undefined => {
  return modules.find(m => m.slug === slug);
};
