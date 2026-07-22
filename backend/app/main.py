"""SIEM Analytics System - FastAPI Backend Server

This is the main entry point for the backend API.
Registers all route modules and initializes the database on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("siem")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: runs on startup and shutdown."""
    logger.info("SIEM Analytics API starting up...")
    await init_db()
    logger.info("[OK] Database tables verified/created")
    logger.info("[OK] API ready at http://0.0.0.0:8000/docs")
    yield
    logger.info("SIEM Analytics API shutting down...")


app = FastAPI(
    title="SIEM Analytics API",
    description="Intelligent SIEM Analytics System for Threat Detection, Attack Correlation and Incident Prioritization",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health & Info ────────────────────────────────────────

@app.get("/", tags=["System"])
async def root():
    return {
        "name": "SIEM Analytics API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy"}


# ── Register Route Modules ──────────────────────────────

# Member 2: Auth, Events, Threats, WebSocket
from app.routes import auth_routes, event_routes, threat_routes, websocket

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(event_routes.router, prefix="/api/events", tags=["Events"])
app.include_router(threat_routes.router, prefix="/api/threats", tags=["Threats"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

# Member 3: ML Models & Risk Scores
from app.routes import ml_routes, risk_routes
app.include_router(ml_routes.router, prefix="/api/ml", tags=["ML Models"])
app.include_router(risk_routes.router, prefix="/api/risk-scores", tags=["Risk Scores"])

# Member 4: Security Logic & Attack Chains
from app.routes import chain_routes, compliance_routes, recommendation_routes
app.include_router(chain_routes.router, prefix="/api/attack-chains", tags=["Attack Chains"])
app.include_router(compliance_routes.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(recommendation_routes.router, prefix="/api/recommendations", tags=["Recommendations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
