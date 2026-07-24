"""
SIEM Analytics System - Database Engine & Session Management

Supports two modes:
  1. PostgreSQL (production) — via asyncpg
  2. SQLite (development) — via aiosqlite (no external DB needed)

Set USE_SQLITE=True below to run locally without PostgreSQL/Docker.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os

# ─── Toggle: controlled via Settings.USE_SQLITE (env var USE_SQLITE=true/false) ───
from app.config import get_settings

settings = get_settings()
USE_SQLITE = settings.USE_SQLITE

if USE_SQLITE:
    if os.environ.get("VERCEL"):
        db_path = "/tmp/siem.db"
    else:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "siem.db")
    DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    DATABASE_URL = settings.DATABASE_URL
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
    )

# Session factory — use this in route dependencies
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session.
    Usage in routes:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Creates all tables. Call this on application startup.
    In production, use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
