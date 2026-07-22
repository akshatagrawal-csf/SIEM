"""
SIEM Analytics System - Risk Scoring Routes

Endpoint:
  GET /api/risk-scores  → List all security events with risk scores exceeding a threshold
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import SecurityEvent
from app.schemas import SecurityEventResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[SecurityEventResponse],
    summary="List scored security incidents",
    description="Returns security events with risk scores above min_score threshold, sorted highest risk first.",
)
async def get_risk_scores(
    min_score: float = Query(30.0, ge=0.0, le=100.0, description="Minimum risk score threshold (default 30.0)"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SecurityEvent)
        .where(SecurityEvent.risk_score >= min_score)
        .order_by(SecurityEvent.risk_score.desc())
        .limit(limit)
    )
    events = result.scalars().all()

    return [SecurityEventResponse.model_validate(e) for e in events]
