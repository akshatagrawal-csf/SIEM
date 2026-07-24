"""
SIEM Analytics System - Incident Recommendation Routes

Endpoint:
  GET /api/recommendations  → List incident response recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import IncidentRecommendation
from app.schemas import RecommendationResponse, RecommendationStatusUpdate

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


@router.patch(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
    summary="Update recommendation status",
    description="Updates workflow status of an incident recommendation (pending, in_progress, completed, dismissed).",
)
async def update_recommendation_status(
    recommendation_id: int,
    status_update: RecommendationStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    allowed = {"pending", "in_progress", "completed", "dismissed"}
    new_status = status_update.status.lower()
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Allowed: {', '.join(allowed)}",
        )

    result = await db.execute(
        select(IncidentRecommendation).where(IncidentRecommendation.id == recommendation_id)
    )
    rec = result.scalar_one_or_none()

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with id={recommendation_id} not found",
        )

    rec.status = new_status
    try:
        await db.commit()
        await db.refresh(rec)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update recommendation status: {str(e)}",
        )

    return RecommendationResponse.model_validate(rec)

