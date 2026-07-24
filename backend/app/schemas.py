"""
SIEM Analytics System - Pydantic Schemas

Request/response validation models for all API endpoints.
Pydantic v2 syntax used throughout.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════
# AUTH Schemas
# ═══════════════════════════════════════════

class UserCreate(BaseModel):
    """POST /api/auth/register — request body."""
    username: str = Field(..., min_length=3, max_length=100, examples=["john.doe"])
    password: str = Field(..., min_length=6, max_length=128, examples=["SecureP@ss123"])
    role: str = Field(default="analyst", examples=["analyst"])


class UserLogin(BaseModel):
    """POST /api/auth/login — request body."""
    username: str = Field(..., examples=["john.doe"])
    password: str = Field(..., examples=["SecureP@ss123"])


class TokenResponse(BaseModel):
    """POST /api/auth/login — response."""
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class UserResponse(BaseModel):
    """User info (no password hash)."""
    id: int
    username: str
    role: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# SECURITY EVENT Schemas
# ═══════════════════════════════════════════

class SecurityEventCreate(BaseModel):
    """POST /api/events — request body for event ingestion."""
    timestamp: Optional[datetime] = None
    source_ip: str = Field(..., examples=["192.168.1.100"])
    destination_ip: Optional[str] = Field(None, examples=["10.0.0.5"])
    username: Optional[str] = Field(None, examples=["john.doe"])
    event_type: str = Field(..., examples=["login_failure"])
    login_status: Optional[str] = Field(None, examples=["failed"])
    failed_attempts: int = Field(0, ge=0)
    destination_port: Optional[int] = Field(None, ge=1, le=65535)
    protocol: Optional[str] = Field(None, examples=["TCP"])
    bytes_transferred: int = Field(0, ge=0)
    device_type: Optional[str] = Field(None, examples=["workstation"])
    country: Optional[str] = Field(None, examples=["US"])
    alert_type: Optional[str] = Field(None, examples=["Authentication"])
    severity: Optional[str] = Field(None, examples=["High"])
    label: Optional[str] = Field(None, examples=["Brute Force"])


class SecurityEventResponse(BaseModel):
    """Single security event — used in list responses and detail views."""
    id: int
    timestamp: Optional[datetime] = None
    source_ip: str
    destination_ip: Optional[str] = None
    username: Optional[str] = None
    event_type: str
    login_status: Optional[str] = None
    failed_attempts: int = 0
    destination_port: Optional[int] = None
    protocol: Optional[str] = None
    bytes_transferred: int = 0
    device_type: Optional[str] = None
    country: Optional[str] = None
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    label: Optional[str] = None
    risk_score: float = 0.0
    ml_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    rule_triggered: Optional[str] = None
    recommendation: Optional[str] = None
    escalation: bool = False

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    """GET /api/events — paginated response."""
    events: List[SecurityEventResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class EventStatsResponse(BaseModel):
    """GET /api/events/stats — aggregate counts."""
    total_events: int
    critical: int
    high: int
    medium: int
    low: int
    malicious_count: int
    unique_source_ips: int


# ═══════════════════════════════════════════
# THREAT ANALYTICS Schemas
# ═══════════════════════════════════════════

class SeverityDistItem(BaseModel):
    """Single item in severity distribution."""
    name: str
    count: int
    color: str


class AttackTypeDistItem(BaseModel):
    """Single item in attack type distribution."""
    name: str
    count: int


class TopIPItem(BaseModel):
    """Single item in top attacking IPs."""
    ip: str
    count: int
    country: Optional[str] = None


class TimelineItem(BaseModel):
    """Single item in events timeline."""
    date: str
    count: int
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class PortTargetItem(BaseModel):
    """Single item in top targeted ports."""
    port: int
    count: int
    service: Optional[str] = None


# ═══════════════════════════════════════════
# ATTACK CHAIN Schemas
# ═══════════════════════════════════════════

class AttackChainStageResponse(BaseModel):
    """Single stage within an attack chain."""
    id: int
    stage_number: int
    attack_type: Optional[str] = None
    timestamp: Optional[datetime] = None
    description: Optional[str] = None
    severity: Optional[str] = None

    model_config = {"from_attributes": True}


class AttackChainResponse(BaseModel):
    """Single attack chain with all stages."""
    id: int
    name: Optional[str] = None
    source_ip: Optional[str] = None
    target_system: Optional[str] = None
    username: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    severity: Optional[str] = None
    risk_score: Optional[float] = None
    status: str = "active"
    stages: List[AttackChainStageResponse] = []

    model_config = {"from_attributes": True}


class AttackChainListResponse(BaseModel):
    """GET /api/attack-chains — paginated response."""
    chains: List[AttackChainResponse]
    total: int


class AttackChainStatusUpdate(BaseModel):
    """PATCH /api/attack-chains/{id}/status — request body."""
    status: str = Field(..., examples=["contained"], description="Status: active, contained, resolved")


# ═══════════════════════════════════════════
# COMPLIANCE Schemas
# ═══════════════════════════════════════════

class ComplianceViolationResponse(BaseModel):
    """Single compliance violation."""
    id: int
    timestamp: Optional[datetime] = None
    violation_type: Optional[str] = None
    username: Optional[str] = None
    source_ip: Optional[str] = None
    description: Optional[str] = None
    policy: Optional[str] = None
    severity: Optional[str] = None
    status: str = "open"

    model_config = {"from_attributes": True}


class ComplianceSummaryResponse(BaseModel):
    """GET /api/compliance/summary — aggregate stats."""
    total: int
    open: int
    investigating: int
    resolved: int
    by_type: dict


class ComplianceStatusUpdate(BaseModel):
    """PATCH /api/compliance/violations/{id} — request body."""
    status: str = Field(..., examples=["investigating"], description="Status: open, investigating, resolved")


# ═══════════════════════════════════════════
# RECOMMENDATION Schemas
# ═══════════════════════════════════════════

class RecommendationResponse(BaseModel):
    """Single incident recommendation."""
    id: int
    event_id: Optional[int] = None
    timestamp: Optional[datetime] = None
    source_ip: Optional[str] = None
    username: Optional[str] = None
    attack_type: Optional[str] = None
    severity: Optional[str] = None
    risk_score: Optional[float] = None
    reason: Optional[str] = None
    recommendation: Optional[str] = None
    escalation_level: Optional[str] = None
    status: str = "pending"

    model_config = {"from_attributes": True}


class RecommendationStatusUpdate(BaseModel):
    """PATCH /api/recommendations/{id} — request body."""
    status: str = Field(..., examples=["in_progress"], description="Status: pending, in_progress, completed, dismissed")


# ═══════════════════════════════════════════
# RISK SCORING Schemas
# ═══════════════════════════════════════════

class RiskScoreSummaryResponse(BaseModel):
    """GET /api/risk-scores/summary — aggregate risk stats."""
    average_risk_score: float
    max_risk_score: float
    high_risk_count: int
    total_scored_events: int


# ═══════════════════════════════════════════
# ML MODEL Schemas
# ═══════════════════════════════════════════

class MLModelMetricResponse(BaseModel):
    """Single ML model's performance metrics."""
    model_name: str
    accuracy: Optional[float] = None
    precision_score: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    trained_at: Optional[datetime] = None
    is_active: bool = False

    model_config = {"from_attributes": True}


class MLPerformanceResponse(BaseModel):
    """GET /api/ml/performance — all models' metrics."""
    models: List[MLModelMetricResponse]


class MLPredictionRequest(BaseModel):
    """POST /api/ml/predict — request body."""
    source_ip: str
    destination_ip: Optional[str] = None
    event_type: str
    failed_attempts: int = 0
    destination_port: Optional[int] = None
    protocol: Optional[str] = None
    bytes_transferred: int = 0
    device_type: Optional[str] = None
    country: Optional[str] = None


class MLPredictionResponse(BaseModel):
    """POST /api/ml/predict — response."""
    prediction: str  # normal or malicious
    confidence: float
    risk_score: float
    model_used: str


class FeatureImportanceItem(BaseModel):
    """Single feature importance entry."""
    feature: str
    importance: float


class ConfusionMatrixResponse(BaseModel):
    """GET /api/ml/confusion-matrix — response."""
    labels: List[str]
    matrix: List[List[int]]

