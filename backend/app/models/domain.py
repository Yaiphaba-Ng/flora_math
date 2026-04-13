from typing import Optional, Dict, Any, List
from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    current_streak_days: int = Field(default=0)
    last_active_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuizSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    module_slug: str = Field(index=True)
    score: int = Field(default=0)
    total_questions: int = Field(default=0)
    is_completed: bool = Field(default=False)
    
    # JSON column for dynamic module-specific configuration (e.g. range=[2, 12])
    session_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionMetric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="quizsession.id", index=True)
    question_string: str = Field(index=True)  # e.g., "8 x 7"
    module_slug: str = Field(index=True)
    
    is_correct: bool = Field(default=False)
    response_time_ms: int = Field(default=0, description="Milliseconds taken to submit answer")

class AppConfig(SQLModel, table=True):
    # A generic Key-Value map allowing the frontend to dynamically get custom UI text.
    key: str = Field(primary_key=True)
    value: Dict[str, Any] = Field(sa_column=Column(JSON))
