from abc import ABC, abstractmethod
from typing import Dict, Any, List

class Question(ABC):
    question_string: str
    correct_answer: Any

class BaseQuizModule(ABC):
    slug: str
    title: str
    description: str
    
    @abstractmethod
    def generate_questions(self, config: Dict[str, Any]) -> List[Question]:
        """Generate a series of questions based on a dynamic config."""
        pass

    @abstractmethod
    def evaluate_answer(self, question: Question, user_answer: Any) -> bool:
        """Determines if the answer provided is acceptable."""
        pass
