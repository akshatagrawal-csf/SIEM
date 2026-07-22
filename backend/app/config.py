"""
SIEM Analytics System - Application Configuration
Uses Pydantic Settings to load environment variables from .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # PostgreSQL Database
    POSTGRES_USER: str = "siem_admin"
    POSTGRES_PASSWORD: str = "siem_secure_2024"
    POSTGRES_DB: str = "siem_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Authentication
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 480

    # Backend Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def DATABASE_URL(self) -> str:
        """Async PostgreSQL connection string for SQLAlchemy."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        """Sync PostgreSQL connection string (for Alembic migrations)."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SQLITE_URL(self) -> str:
        """SQLite fallback for development without PostgreSQL."""
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "siem.db")
        return f"sqlite+aiosqlite:///{db_path}"

    model_config = {
        "env_file": os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton. Call this to access configuration."""
    return Settings()
