"""
SIEM Analytics System - Incident Recommendation Routes

Endpoint:
  GET /api/recommendations  → List incident response recommendations
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import IncidentRecommendation
from app.schemas import RecommendationResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[RecommendationResponse],
    summary="List incident response recommendations",
    description="Returns AI/ML generated remediation playbooks and escalation guidance sorted by risk score.",
)
async def get_recommendations(
    escalation_filter: Optional[str] = Query(None, alias="escalation", description="Filter by escalation level: Monitor, Investigate, Escalate, Isolate"),
    limit: int = Query(50, ge=1, le=200, description="Max recommendations to return"),
    db: AsyncSession = Depends(get_db),
):
    query = select(IncidentRecommendation).order_by(IncidentRecommendation.risk_score.desc())
    if escalation_filter:
        query = query.where(IncidentRecommendation.escalation_level.ilike(escalation_filter))

    query = query.limit(limit)
    result = await db.execute(query)
    recs = result.scalars().all()

    return [RecommendationResponse.model_validate(r) for r in recs]
