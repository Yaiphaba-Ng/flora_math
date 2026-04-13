from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from app.db.database import get_session
from app.models.domain import QuizSession, QuestionMetric
from app.services.registry import registry
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class StartSessionRequest(BaseModel):
    user_id: int
    module_slug: str
    config: Dict[str, Any]

@router.get("/modules")
def get_available_modules():
    return registry.list_modules()

@router.post("/start")
def start_quiz_session(payload: StartSessionRequest, db: Session = Depends(get_session)):
    plugin = registry.get_module(payload.module_slug)
    if not plugin:
        raise HTTPException(status_code=404, detail="Quiz module not found")
        
    questions = plugin.generate_questions(payload.config)
    
    # Init DB Session
    session_record = QuizSession(
        user_id=payload.user_id,
        module_slug=payload.module_slug,
        total_questions=len(questions),
        session_data=payload.config
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)
    
    # Ideally, we cache the 'questions' list in Redis or serialize it into session_data here
    # For now, we return the session ID and the first question.
    if not questions:
         raise HTTPException(status_code=400, detail="Config generated 0 questions")
         
    return {
        "session_id": session_record.id,
        "total": len(questions),
        # In a real setup, we don't expose 'correct_answer' to the client.
        "first_question": questions[0].question_string
    }

class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_string: str
    user_answer: Any
    time_taken_ms: int

@router.post("/answer")
def submit_answer(payload: SubmitAnswerRequest, db: Session = Depends(get_session)):
    session_record = db.get(QuizSession, payload.session_id)
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")
        
    plugin = registry.get_module(session_record.module_slug)
    # We would reconstruct the question object here or validate against the cache.
    # For now, dummy logic to track the metric map exactly as planned.
    is_correct = True # Dummy truth evaluation
    
    metric = QuestionMetric(
        session_id=payload.session_id,
        question_string=payload.question_string,
        module_slug=session_record.module_slug,
        is_correct=is_correct,
        response_time_ms=payload.time_taken_ms
    )
    db.add(metric)
    db.commit()
    
    return {"status": "recorded", "is_correct": is_correct}
