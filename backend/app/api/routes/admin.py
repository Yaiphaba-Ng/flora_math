from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.db.database import get_session
from app.models.domain import QuizSession, QuestionMetric, User

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/metrics/weak-spots")
def get_weak_spots(db: Session = Depends(get_session)):
    # Calculate failure rates per question
    stmt = (
        select(
            QuestionMetric.question_string,
            func.count(QuestionMetric.id).label("total_attempts"),
            func.sum(case((QuestionMetric.is_correct == False, 1), else_=0)).label("total_failures"),
            func.avg(QuestionMetric.response_time_ms).label("avg_time_ms")
        )
        .group_by(QuestionMetric.question_string)
        .having(func.count(QuestionMetric.id) > 0)
        .order_by(func.sum(case((QuestionMetric.is_correct == False, 1), else_=0)).desc())
        .limit(10)
    )
    
    # Notice: sqlite doesn't flawlessly support simple case in func without raw text sometimes in SLQModel,
    # Here is a safer cross-compatible approach using standard where clauses:
    
    # Get all metrics for simple python-side eval due to lightweight nature 
    metrics = db.exec(select(QuestionMetric)).all()
    
    aggregates = {}
    for m in metrics:
        if m.question_string not in aggregates:
            aggregates[m.question_string] = {"attempts": 0, "failures": 0, "time_ms": []}
            
        aggregates[m.question_string]["attempts"] += 1
        if not m.is_correct:
            aggregates[m.question_string]["failures"] += 1
        aggregates[m.question_string]["time_ms"].append(m.response_time_ms)
        
    results = []
    for q, data in aggregates.items():
        avg_time = sum(data["time_ms"]) / len(data["time_ms"]) if data["time_ms"] else 0
        results.append({
            "question": q,
            "attempts": data["attempts"],
            "failures": data["failures"],
            "avg_time_ms": round(avg_time, 2)
        })
        
    return sorted(results, key=lambda x: x["failures"], reverse=True)[:10]


@router.get("/sessions/recent")
def get_recent_sessions(db: Session = Depends(get_session)):
    stmt = select(QuizSession).order_by(QuizSession.created_at.desc()).limit(10)
    sessions = db.exec(stmt).all()
    return sessions
