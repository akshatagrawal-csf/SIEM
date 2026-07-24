"""
SIEM Analytics System - Attack Chain Routes

Endpoints:
  GET /api/attack-chains       → List detected attack chains
  GET /api/attack-chains/{id}  → Get single attack chain details with stages
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import AttackChain, AttackChainStage, SecurityEvent
from app.schemas import AttackChainResponse, AttackChainListResponse, AttackChainStatusUpdate
from app.services.attack_correlation import correlate_events

router = APIRouter()



@router.get(
    "",
    response_model=AttackChainListResponse,
    summary="List attack chains",
    description="Returns detected multi-stage attack chains with timeline stages.",
)
async def get_attack_chains(
    limit: int = Query(20, ge=1, le=100, description="Max chains to return"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AttackChain)
        .options(selectinload(AttackChain.stages))
        .order_by(AttackChain.risk_score.desc())
        .limit(limit)
    )
    chains = result.scalars().all()

    return AttackChainListResponse(
        chains=[AttackChainResponse.model_validate(c) for c in chains],
        total=len(chains),
    )


@router.get(
    "/{chain_id}",
    response_model=AttackChainResponse,
    summary="Get single attack chain details",
    description="Returns full details of an attack chain including all chronological stages.",
)
async def get_attack_chain_by_id(chain_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AttackChain)
        .options(selectinload(AttackChain.stages))
        .where(AttackChain.id == chain_id)
    )
    chain = result.scalar_one_or_none()

    if not chain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attack chain with id={chain_id} not found",
        )

    return AttackChainResponse.model_validate(chain)


@router.patch(
    "/{chain_id}/status",
    response_model=AttackChainResponse,
    summary="Update attack chain status",
    description="Updates the lifecycle status of an attack chain (e.g., active, contained, resolved).",
)
async def update_attack_chain_status(
    chain_id: int,
    status_update: AttackChainStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    allowed_statuses = {"active", "contained", "resolved"}
    new_status = status_update.status.lower()
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Allowed: {', '.join(allowed_statuses)}",
        )

    result = await db.execute(
        select(AttackChain)
        .options(selectinload(AttackChain.stages))
        .where(AttackChain.id == chain_id)
    )
    chain = result.scalar_one_or_none()

    if not chain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attack chain with id={chain_id} not found",
        )

    chain.status = new_status
    try:
        await db.commit()
        await db.refresh(chain)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update attack chain status: {str(e)}",
        )

    return AttackChainResponse.model_validate(chain)


@router.post(
    "/correlate",
    response_model=AttackChainListResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger attack chain correlation",
    description="Analyzes security events in the database to detect and correlate new multi-stage attack chains.",
)
async def trigger_correlation(
    db: AsyncSession = Depends(get_db),
):
    # Fetch non-normal security events
    evt_result = await db.execute(
        select(SecurityEvent)
        .where(SecurityEvent.label != "Normal")
        .order_by(SecurityEvent.timestamp.asc())
    )
    events = evt_result.scalars().all()

    event_dicts = [
        {
            "id": e.id,
            "timestamp": e.timestamp,
            "source_ip": e.source_ip,
            "destination_ip": e.destination_ip,
            "username": e.username,
            "event_type": e.event_type,
            "severity": e.severity,
            "label": e.label,
            "risk_score": e.risk_score,
        }
        for e in events
    ]

    correlated_chains = correlate_events(event_dicts)
    new_chains = []

    for chain_data in correlated_chains:
        stages_data = chain_data.pop("stages", [])
        new_chain = AttackChain(**chain_data)
        db.add(new_chain)
        await db.flush()  # assign id

        for stage_info in stages_data:
            stage = AttackChainStage(
                chain_id=new_chain.id,
                stage_number=stage_info["stage_number"],
                attack_type=stage_info["attack_type"],
                timestamp=stage_info["timestamp"],
                description=stage_info["description"],
                severity=stage_info["severity"],
            )
            db.add(stage)
        new_chains.append(new_chain)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save correlated attack chains: {str(e)}",
        )

    # Re-query newly created chains with loaded stages
    chain_ids = [c.id for c in new_chains]
    result_chains = []
    if chain_ids:
        res = await db.execute(
            select(AttackChain)
            .options(selectinload(AttackChain.stages))
            .where(AttackChain.id.in_(chain_ids))
        )
        result_chains = res.scalars().all()

    return AttackChainListResponse(
        chains=[AttackChainResponse.model_validate(c) for c in result_chains],
        total=len(result_chains),
    )

