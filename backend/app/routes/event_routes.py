"""
SIEM Analytics System - Event Routes

Endpoints:
  GET /api/events          → Paginated event list with filters
  GET /api/events/stats    → Aggregate event statistics
  GET /api/events/{id}     → Single event detail
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import datetime
import math

from app.database import get_db
from app.models import SecurityEvent
from app.schemas import SecurityEventResponse, EventListResponse, EventStatsResponse
from app.auth import get_current_user

router = APIRouter()


@router.get(
    "",
    response_model=EventListResponse,
    summary="List security events",
    description="Returns paginated security events with optional filters for severity, event type, source IP, label, and date range.",
)
async def get_events(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    severity: Optional[str] = Query(None, description="Filter by severity: Low, Medium, High, Critical"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    source_ip: Optional[str] = Query(None, description="Filter by source IP"),
    label: Optional[str] = Query(None, description="Filter by label (e.g. Brute Force, Port Scan)"),
    date_from: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO 8601)"),
    search: Optional[str] = Query(None, description="Search across username, source_ip, event_type"),
    db: AsyncSession = Depends(get_db),
):
    # Build filter conditions
    conditions = []

    if severity:
        conditions.append(SecurityEvent.severity == severity)
    if event_type:
        conditions.append(SecurityEvent.event_type == event_type)
    if source_ip:
        conditions.append(SecurityEvent.source_ip == source_ip)
    if label:
        conditions.append(SecurityEvent.label == label)
    if date_from:
        try:
            dt_from = datetime.fromisoformat(date_from)
            conditions.append(SecurityEvent.timestamp >= dt_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use ISO 8601.")
    if date_to:
        try:
            dt_to = datetime.fromisoformat(date_to)
            conditions.append(SecurityEvent.timestamp <= dt_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use ISO 8601.")
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            (SecurityEvent.username.ilike(search_pattern))
            | (SecurityEvent.source_ip.ilike(search_pattern))
            | (SecurityEvent.event_type.ilike(search_pattern))
        )

    # Count total matching records
    count_query = select(func.count(SecurityEvent.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Calculate pagination
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    # Fetch events
    query = (
        select(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .offset(offset)
        .limit(page_size)
    )
    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    events = result.scalars().all()

    return EventListResponse(
        events=[SecurityEventResponse.model_validate(e) for e in events],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/stats",
    response_model=EventStatsResponse,
    summary="Event aggregate statistics",
    description="Returns total event count, breakdown by severity, malicious count, and unique source IPs.",
)
async def get_event_stats(db: AsyncSession = Depends(get_db)):
    # Total events
    total_result = await db.execute(select(func.count(SecurityEvent.id)))
    total_events = total_result.scalar() or 0

    # Count by severity
    severity_counts = {}
    for sev in ["Critical", "High", "Medium", "Low"]:
        result = await db.execute(
            select(func.count(SecurityEvent.id)).where(SecurityEvent.severity == sev)
        )
        severity_counts[sev.lower()] = result.scalar() or 0

    # Malicious count (ML prediction)
    mal_result = await db.execute(
        select(func.count(SecurityEvent.id)).where(SecurityEvent.ml_prediction == "malicious")
    )
    malicious_count = mal_result.scalar() or 0

    # Unique source IPs
    ip_result = await db.execute(
        select(func.count(func.distinct(SecurityEvent.source_ip)))
    )
    unique_ips = ip_result.scalar() or 0

    return EventStatsResponse(
        total_events=total_events,
        critical=severity_counts.get("critical", 0),
        high=severity_counts.get("high", 0),
        medium=severity_counts.get("medium", 0),
        low=severity_counts.get("low", 0),
        malicious_count=malicious_count,
        unique_source_ips=unique_ips,
    )


@router.get(
    "/{event_id}",
    response_model=SecurityEventResponse,
    summary="Get single event by ID",
    description="Returns full details of a specific security event.",
)
async def get_event_by_id(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SecurityEvent).where(SecurityEvent.id == event_id)
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id={event_id} not found",
        )

    return SecurityEventResponse.model_validate(event)
