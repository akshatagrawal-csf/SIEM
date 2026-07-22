"""
SIEM Analytics System - SQLAlchemy ORM Models

All database tables are defined here as ORM classes.
Tables:
  - User              → JWT auth users
  - SecurityEvent     → Core security event logs
  - AttackChain       → Correlated multi-stage attack chains
  - AttackChainStage  → Individual stages within a chain
  - ComplianceViolation → Policy/compliance violations
  - IncidentRecommendation → AI/ML generated response recommendations
  - MLModelMetric     → ML model performance snapshots
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, BigInteger,
    ForeignKey, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class User(Base):
    """User accounts for JWT authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="analyst")  # analyst, admin, manager
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"


class SecurityEvent(Base):
    """Core security event log entries — the heart of the SIEM."""
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    source_ip = Column(String(45), nullable=False, index=True)
    destination_ip = Column(String(45))
    username = Column(String(100), index=True)
    event_type = Column(String(50), nullable=False, index=True)
    login_status = Column(String(20))
    failed_attempts = Column(Integer, default=0)
    destination_port = Column(Integer)
    protocol = Column(String(10))
    bytes_transferred = Column(BigInteger, default=0)
    device_type = Column(String(30))
    country = Column(String(5))
    alert_type = Column(String(30))
    severity = Column(String(10), index=True)  # Low, Medium, High, Critical
    label = Column(String(30))  # Normal, Brute Force, Port Scan, Malware, etc.
    risk_score = Column(Float, default=0.0)
    ml_prediction = Column(String(20))  # normal, malicious
    ml_confidence = Column(Float)
    rule_triggered = Column(Text)
    recommendation = Column(Text)
    escalation = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    chain_stages = relationship("AttackChainStage", back_populates="event")
    recommendations = relationship("IncidentRecommendation", back_populates="event")

    # Indexes for common queries
    __table_args__ = (
        Index("ix_events_severity_type", "severity", "event_type"),
        Index("ix_events_source_severity", "source_ip", "severity"),
    )

    def __repr__(self):
        return f"<SecurityEvent(id={self.id}, type='{self.event_type}', severity='{self.severity}')>"


class AttackChain(Base):
    """Correlated multi-stage attack chains detected by the correlation engine."""
    __tablename__ = "attack_chains"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200))
    source_ip = Column(String(45))
    target_system = Column(String(45))
    username = Column(String(100))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    severity = Column(String(10))
    risk_score = Column(Float)
    status = Column(String(20), default="active")  # active, contained, resolved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    stages = relationship("AttackChainStage", back_populates="chain", order_by="AttackChainStage.stage_number")

    def __repr__(self):
        return f"<AttackChain(id={self.id}, name='{self.name}', severity='{self.severity}')>"


class AttackChainStage(Base):
    """Individual stage within a multi-stage attack chain."""
    __tablename__ = "attack_chain_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chain_id = Column(Integer, ForeignKey("attack_chains.id"), nullable=False, index=True)
    stage_number = Column(Integer, nullable=False)
    attack_type = Column(String(30))
    timestamp = Column(DateTime)
    description = Column(Text)
    severity = Column(String(10))
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)

    # Relationships
    chain = relationship("AttackChain", back_populates="stages")
    event = relationship("SecurityEvent", back_populates="chain_stages")

    def __repr__(self):
        return f"<AttackChainStage(chain_id={self.chain_id}, stage={self.stage_number}, type='{self.attack_type}')>"


class ComplianceViolation(Base):
    """Policy and compliance violations detected by the compliance engine."""
    __tablename__ = "compliance_violations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    violation_type = Column(String(50), index=True)
    username = Column(String(100))
    source_ip = Column(String(45))
    description = Column(Text)
    policy = Column(String(100))
    severity = Column(String(10))
    status = Column(String(20), default="open")  # open, investigating, resolved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<ComplianceViolation(id={self.id}, type='{self.violation_type}', status='{self.status}')>"


class IncidentRecommendation(Base):
    """AI/ML generated incident response recommendations."""
    __tablename__ = "incident_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)
    timestamp = Column(DateTime)
    source_ip = Column(String(45))
    username = Column(String(100))
    attack_type = Column(String(30))
    severity = Column(String(10))
    risk_score = Column(Float)
    reason = Column(Text)
    recommendation = Column(Text)
    escalation_level = Column(String(20))  # Monitor, Investigate, Escalate, Isolate
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    event = relationship("SecurityEvent", back_populates="recommendations")

    def __repr__(self):
        return f"<IncidentRecommendation(id={self.id}, severity='{self.severity}', escalation='{self.escalation_level}')>"


class MLModelMetric(Base):
    """Snapshot of ML model performance metrics after training runs."""
    __tablename__ = "ml_model_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(50), nullable=False)
    accuracy = Column(Float)
    precision_score = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=False)

    def __repr__(self):
        return f"<MLModelMetric(model='{self.model_name}', accuracy={self.accuracy}, active={self.is_active})>"
