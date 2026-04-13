import json
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.domain import QuizSession, QuestionMetric, ConfigUsage
from app.services.registry import registry
from pydantic import BaseModel
from typing import Dict, Any, Optional

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
    if not questions:
        raise HTTPException(status_code=400, detail="Config generated 0 questions")

    # Honour num_questions: trim the shuffled list to the requested length
    num_questions = int(payload.config.get("num_questions", 20))
    questions = questions[:max(1, num_questions)]

    # Serialize generated question list (strings + answers) into session_data.
    # This avoids any Redis dependency while keeping all state server-side.
    serialized_qs = [
        {"q": q.question_string, "a": q.correct_answer}
        for q in questions
    ]

    session_record = QuizSession(
        user_id=payload.user_id,
        module_slug=payload.module_slug,
        total_questions=len(questions),
        session_data={
            "config": payload.config,
            "questions": serialized_qs,
            "current_index": 0,
        }
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)

    # ── Record config usage for dynamic chip suggestions ──────────────────────
    for field_key, field_value in payload.config.items():
        # Only track numeric values — booleans/toggles are not shown as chips
        if not isinstance(field_value, bool) and isinstance(field_value, (int, float)):
            str_val = str(int(field_value))
            existing = db.exec(
                select(ConfigUsage).where(
                    ConfigUsage.module_slug == payload.module_slug,
                    ConfigUsage.field_key == field_key,
                    ConfigUsage.field_value == str_val,
                )
            ).first()
            if existing:
                existing.use_count += 1
                db.add(existing)
            else:
                db.add(ConfigUsage(
                    module_slug=payload.module_slug,
                    field_key=field_key,
                    field_value=str_val,
                ))
    db.commit()
    # ── End usage recording ───────────────────────────────────────────────────

    return {
        "session_id": session_record.id,
        "total": len(questions),
        "first_question": serialized_qs[0]["q"],
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

    data = session_record.session_data
    questions = data.get("questions", [])
    current_index = data.get("current_index", 0)

    if current_index >= len(questions):
        raise HTTPException(status_code=400, detail="Session already completed")

    current_q = questions[current_index]

    # Real answer validation — compare against the stored correct answer
    try:
        is_correct = int(payload.user_answer) == int(current_q["a"])
    except (ValueError, TypeError):
        is_correct = False

    # Advance the index
    next_index = current_index + 1
    is_finished = next_index >= len(questions)

    # Update session state in DB
    session_record.session_data = {
        **data,
        "current_index": next_index,
    }
    if is_correct:
        session_record.score += 1
    if is_finished:
        session_record.is_completed = True

    # Record the per-question metric for analytics
    metric = QuestionMetric(
        session_id=payload.session_id,
        question_string=payload.question_string,
        module_slug=session_record.module_slug,
        is_correct=is_correct,
        response_time_ms=payload.time_taken_ms,
    )
    db.add(metric)
    db.add(session_record)
    db.commit()

    return {
        "is_correct": is_correct,
        "is_finished": is_finished,
        "next_question": questions[next_index]["q"] if not is_finished else None,
        "score": session_record.score,
        "correct_answer": str(current_q["a"]),
    }
