"""
SIEM Analytics System - Compliance Routes

Endpoints:
  GET /api/compliance/violations  → List compliance violations
  GET /api/compliance/summary     → Summary statistics by status & policy
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.database import get_db
from app.models import ComplianceViolation
from app.schemas import ComplianceViolationResponse, ComplianceSummaryResponse

router = APIRouter()


@router.get(
    "/violations",
    response_model=List[ComplianceViolationResponse],
    summary="List compliance violations",
    description="Returns recorded regulatory compliance policy breaches.",
)
async def get_compliance_violations(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: open, investigating, resolved"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    query = select(ComplianceViolation).order_by(ComplianceViolation.timestamp.desc())
    if status_filter:
        query = query.where(ComplianceViolation.status == status_filter.lower())

    query = query.limit(limit)
    result = await db.execute(query)
    violations = result.scalars().all()

    return [ComplianceViolationResponse.model_validate(v) for v in violations]


@router.get(
    "/summary",
    response_model=ComplianceSummaryResponse,
    summary="Get compliance summary statistics",
    description="Returns aggregate counts of open, investigating, and resolved compliance violations.",
)
async def get_compliance_summary(db: AsyncSession = Depends(get_db)):
    total_res = await db.execute(select(func.count(ComplianceViolation.id)))
    total = total_res.scalar() or 0

    open_res = await db.execute(
        select(func.count(ComplianceViolation.id)).where(ComplianceViolation.status == "open")
    )
    open_cnt = open_res.scalar() or 0

    inv_res = await db.execute(
        select(func.count(ComplianceViolation.id)).where(ComplianceViolation.status == "investigating")
    )
    inv_cnt = inv_res.scalar() or 0

    res_cnt = total - (open_cnt + inv_cnt)

    # Group by violation type
    type_res = await db.execute(
        select(ComplianceViolation.violation_type, func.count(ComplianceViolation.id))
        .group_by(ComplianceViolation.violation_type)
    )
    by_type = dict(type_res.all())

    return ComplianceSummaryResponse(
        total=total,
        open=open_cnt,
        investigating=inv_cnt,
        resolved=max(0, res_cnt),
        by_type=by_type,
    )
