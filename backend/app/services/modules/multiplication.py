import random
from typing import Dict, Any, List
from .base_module import BaseQuizModule, Question

class MultiplicationQuestion(Question):
    def __init__(self, num1: int, num2: int):
        self.question_string = f"{num1} x {num2}"
        self.correct_answer = num1 * num2

class MultiplicationModule(BaseQuizModule):
    slug = "multiplication"
    title = "Multiplication Tables"
    description = "Master your times tables with configurable ranges."

    def generate_questions(self, config: Dict[str, Any]) -> List[Question]:
        '''
        Expects config:
        - range_start: int (e.g. 2)
        - range_end: int (e.g. 12)
        - length: int (e.g. 10 to test up to x10)
        '''
        range_start = config.get("range_start", 2)
        range_end = config.get("range_end", 12)
        length = config.get("length", 10)
        
        easy_nums = {0, 1, 10, 11}
        questions = []
        for table_num in range(range_start, range_end + 1):
            if table_num in easy_nums:
                continue
            for multiplier in range(1, length + 1):
                if multiplier in easy_nums:
                    continue
                questions.append(MultiplicationQuestion(table_num, multiplier))
                
        # Shuffle internally to gamify it
        random.shuffle(questions)
        return questions

    def evaluate_answer(self, question: Question, user_answer: Any) -> bool:
        try:
            return int(user_answer) == question.correct_answer
        except ValueError:
            return False

# Registering automatically allows plugin-style architecture
def register() -> BaseQuizModule:
    return MultiplicationModule()
