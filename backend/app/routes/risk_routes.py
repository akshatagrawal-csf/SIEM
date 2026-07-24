"""
SIEM Analytics System - Risk Scoring Routes

Endpoint:
  GET /api/risk-scores  → List all security events with risk scores exceeding a threshold
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.database import get_db
from app.models import SecurityEvent
from app.schemas import SecurityEventResponse, RiskScoreSummaryResponse

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


@router.get(
    "/summary",
    response_model=RiskScoreSummaryResponse,
    summary="Get aggregate risk score metrics",
    description="Returns aggregate risk metrics including average score, maximum score, and high-risk count.",
)
async def get_risk_score_summary(db: AsyncSession = Depends(get_db)):
    avg_res = await db.execute(select(func.avg(SecurityEvent.risk_score)))
    avg_score = avg_res.scalar() or 0.0

    max_res = await db.execute(select(func.max(SecurityEvent.risk_score)))
    max_score = max_res.scalar() or 0.0

    high_res = await db.execute(
        select(func.count(SecurityEvent.id)).where(SecurityEvent.risk_score >= 70.0)
    )
    high_count = high_res.scalar() or 0

    total_res = await db.execute(
        select(func.count(SecurityEvent.id)).where(SecurityEvent.risk_score > 0)
    )
    total_count = total_res.scalar() or 0

    return RiskScoreSummaryResponse(
        average_risk_score=round(float(avg_score), 2),
        max_risk_score=round(float(max_score), 2),
        high_risk_count=high_count,
        total_scored_events=total_count,
    )

