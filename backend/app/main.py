"""SIEM Analytics System - FastAPI Backend Server

This is the main entry point for the backend API.
Teammates: Build your routes and services, then register them here.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="SIEM Analytics API",
    description="Intelligent SIEM Analytics System for Threat Detection, Attack Correlation and Incident Prioritization",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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

@app.get("/")
async def root():
    return {
        "name": "SIEM Analytics API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# TODO: Member 2 - Register route modules here:
# from app.routes import auth_routes, event_routes, threat_routes, websocket
# app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(event_routes.router, prefix="/api/events", tags=["Events"])
# app.include_router(threat_routes.router, prefix="/api/threats", tags=["Threats"])

# TODO: Member 3 - Register ML routes:
# from app.routes import ml_routes, risk_routes
# app.include_router(ml_routes.router, prefix="/api/ml", tags=["ML Models"])
# app.include_router(risk_routes.router, prefix="/api/risk-scores", tags=["Risk Scores"])

# TODO: Member 4 - Register detection routes:
# from app.routes import chain_routes, compliance_routes, recommendation_routes
# app.include_router(chain_routes.router, prefix="/api/attack-chains", tags=["Attack Chains"])
# app.include_router(compliance_routes.router, prefix="/api/compliance", tags=["Compliance"])
# app.include_router(recommendation_routes.router, prefix="/api/recommendations", tags=["Recommendations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
