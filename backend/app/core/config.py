import os

class Config:
    PROJECT_NAME = "Numerical Aptitude Quizzer"
    # Local SQLite DB for huge portability and no setup
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./numerical_quizzer.db")

settings = Config()
