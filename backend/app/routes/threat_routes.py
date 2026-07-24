"""
SIEM Analytics System - Threat Analytics Routes

Endpoints:
  GET /api/threats/by-severity  → Severity distribution [{name, count, color}]
  GET /api/threats/by-type      → Attack type distribution [{name, count}]
  GET /api/threats/top-ips      → Top 10 attacking IPs [{ip, count, country}]
  GET /api/threats/timeline     → Events by date [{date, count, critical, high, medium, low}]
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, cast, String
from typing import Optional

from app.database import get_db
from app.models import SecurityEvent
from app.schemas import PortTargetItem

router = APIRouter()

SEVERITY_COLORS = {
    "Critical": "#FF2255",
    "High": "#FF7700",
    "Medium": "#FFB800",
    "Low": "#00FF9D",
}

COMMON_PORT_NAMES = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    1433: "MSSQL",
    1521: "Oracle",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    8080: "HTTP-Proxy",
}



@router.get(
    "/by-severity",
    summary="Severity distribution",
    description="Returns count of events grouped by severity level with color codes.",
)
async def threats_by_severity(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            SecurityEvent.severity,
            func.count(SecurityEvent.id).label("count"),
        )
        .where(SecurityEvent.severity.isnot(None))
        .group_by(SecurityEvent.severity)
    )
    rows = result.all()

    return [
        {
            "name": row.severity,
            "count": row.count,
            "color": SEVERITY_COLORS.get(row.severity, "#71717A"),
        }
        for row in rows
    ]


@router.get(
    "/by-type",
    summary="Attack type distribution",
    description="Returns count of events grouped by event type (excluding 'Normal' label).",
)
async def threats_by_type(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            SecurityEvent.event_type,
            func.count(SecurityEvent.id).label("count"),
        )
        .where(SecurityEvent.label != "Normal")
        .group_by(SecurityEvent.event_type)
        .order_by(func.count(SecurityEvent.id).desc())
    )
    rows = result.all()

    return [
        {"name": row.event_type, "count": row.count}
        for row in rows
    ]


@router.get(
    "/top-ips",
    summary="Top attacking IPs",
    description="Returns the top N source IPs with the most threat-flagged events.",
)
async def threats_top_ips(
    limit: int = Query(10, ge=1, le=50, description="Number of top IPs to return"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            SecurityEvent.source_ip,
            func.count(SecurityEvent.id).label("count"),
            SecurityEvent.country,
        )
        .where(SecurityEvent.label != "Normal")
        .group_by(SecurityEvent.source_ip, SecurityEvent.country)
        .order_by(func.count(SecurityEvent.id).desc())
        .limit(limit)
    )
    rows = result.all()

    return [
        {"ip": row.source_ip, "count": row.count, "country": row.country}
        for row in rows
    ]


@router.get(
    "/timeline",
    summary="Events timeline",
    description="Returns event counts grouped by date with severity breakdown. Useful for area/bar charts.",
)
async def threats_timeline(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    db: AsyncSession = Depends(get_db),
):
    # Group by date (extract date part from timestamp)
    # SQLite uses date() function, PostgreSQL uses DATE()
    from app.database import USE_SQLITE

    if USE_SQLITE:
        date_expr = func.date(SecurityEvent.timestamp)
    else:
        date_expr = cast(SecurityEvent.timestamp, String).op("::date")(None)
        # Fallback: use func.date for broader compatibility
        date_expr = func.date(SecurityEvent.timestamp)

    result = await db.execute(
        select(
            date_expr.label("event_date"),
            func.count(SecurityEvent.id).label("total"),
            func.sum(case((SecurityEvent.severity == "Critical", 1), else_=0)).label("critical"),
            func.sum(case((SecurityEvent.severity == "High", 1), else_=0)).label("high"),
            func.sum(case((SecurityEvent.severity == "Medium", 1), else_=0)).label("medium"),
            func.sum(case((SecurityEvent.severity == "Low", 1), else_=0)).label("low"),
        )
        .where(SecurityEvent.timestamp.isnot(None))
        .group_by(date_expr)
        .order_by(date_expr)
    )
    rows = result.all()

    return [
        {
            "date": str(row.event_date),
            "count": row.total,
            "critical": row.critical or 0,
            "high": row.high or 0,
            "medium": row.medium or 0,
            "low": row.low or 0,
        }
        for row in rows
    ]


@router.get(
    "/top-ports",
    response_model=list[PortTargetItem],
    summary="Top targeted ports",
    description="Returns the top N destination ports targeted by security events.",
)
async def threats_top_ports(
    limit: int = Query(10, ge=1, le=50, description="Number of top ports to return"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            SecurityEvent.destination_port,
            func.count(SecurityEvent.id).label("count"),
        )
        .where(SecurityEvent.destination_port.isnot(None))
        .group_by(SecurityEvent.destination_port)
        .order_by(func.count(SecurityEvent.id).desc())
        .limit(limit)
    )
    rows = result.all()

    return [
        PortTargetItem(
            port=row.destination_port,
            count=row.count,
            service=COMMON_PORT_NAMES.get(row.destination_port, "Unknown"),
        )
        for row in rows
    ]

