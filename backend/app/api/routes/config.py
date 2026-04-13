from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.domain import ConfigUsage
from typing import Dict, List

router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("/suggestions/{module_slug}")
def get_suggestions(module_slug: str, db: Session = Depends(get_session)) -> Dict[str, List]:
    """
    Returns the top-5 most frequently used values per config field for the given module.
    The frontend uses this to dynamically populate the quick-select chip bubbles.
    Returns an empty list per field when no history exists yet.
    """
    rows = db.exec(
        select(ConfigUsage)
        .where(ConfigUsage.module_slug == module_slug)
        .order_by(ConfigUsage.use_count.desc())
    ).all()

    # Aggregate per field_key, take top 5
    suggestions: Dict[str, List] = {}
    field_counts: Dict[str, int] = {}

    for row in rows:
        key = row.field_key
        if key not in suggestions:
            suggestions[key] = []
            field_counts[key] = 0
        if field_counts[key] < 5:
            # Try to parse as int/float for cleaner frontend use
            try:
                suggestions[key].append(int(row.field_value))
            except ValueError:
                suggestions[key].append(row.field_value)
            field_counts[key] += 1

    return suggestions
