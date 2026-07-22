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
from app.models import AttackChain
from app.schemas import AttackChainResponse, AttackChainListResponse

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
