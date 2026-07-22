"""
SIEM Analytics System - Security Logic Unit Tests

Tests cover:
  - Rule-based detection engine (RULE-001 to RULE-007)
  - Multi-stage attack chain correlation engine
  - Compliance framework policy evaluation
  - Incident response recommendation playbooks
  - Member 4 API routes (/api/attack-chains, /api/compliance, /api/recommendations)
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.services.rule_engine import evaluate_event, get_all_rules
from app.services.attack_correlation import correlate_events
from app.services.compliance import evaluate_compliance
from app.services.recommendations import generate_recommendation


def test_rule_brute_force():
    """Verify RULE-001 triggers on >= 5 failed attempts."""
    evt = {"failed_attempts": 6, "label": "Brute Force"}
    rules = evaluate_event(evt)
    rule_ids = [r["rule_id"] for r in rules]
    assert "RULE-001" in rule_ids


def test_rule_exfiltration():
    """Verify RULE-003 triggers on > 500MB data transfer."""
    evt = {"bytes_transferred": 600_000_000, "label": "Data Exfiltration"}
    rules = evaluate_event(evt)
    rule_ids = [r["rule_id"] for r in rules]
    assert "RULE-003" in rule_ids


def test_rule_malware():
    """Verify RULE-006 triggers on malicious C2 port 4444."""
    evt = {"destination_port": 4444, "label": "Malware"}
    rules = evaluate_event(evt)
    rule_ids = [r["rule_id"] for r in rules]
    assert "RULE-006" in rule_ids


def test_attack_correlation():
    """Verify event correlation groups events from same IP into attack chains."""
    events = [
        {"source_ip": "45.33.32.156", "label": "Port Scan", "timestamp": "2024-01-15 02:00:00", "severity": "Low"},
        {"source_ip": "45.33.32.156", "label": "Brute Force", "timestamp": "2024-01-15 02:15:00", "severity": "High"},
        {"source_ip": "45.33.32.156", "label": "Data Exfiltration", "timestamp": "2024-01-15 03:00:00", "severity": "Critical"},
    ]
    chains = correlate_events(events)
    assert len(chains) == 1
    assert chains[0]["source_ip"] == "45.33.32.156"
    assert len(chains[0]["stages"]) == 3
    assert chains[0]["severity"] == "Critical"


def test_compliance_unencrypted():
    """Verify compliance violation generated for unencrypted FTP data transfer."""
    evt = {"protocol": "FTP", "bytes_transferred": 50_000_000}
    violations = evaluate_compliance(evt)
    assert len(violations) >= 1
    assert violations[0]["violation_type"] == "Unencrypted Transfer"


def test_recommendation_critical():
    """Verify Critical risk score generates Isolate escalation recommendation."""
    evt = {"label": "Data Exfiltration", "source_ip": "45.33.32.156", "username": "svc_backup"}
    rec = generate_recommendation(evt, risk_score=92.5)
    assert rec["escalation_level"] == "Isolate"
    assert "Block Egress" in rec["specific_actions"]


# ═══════════════════════════════════════════
# MEMBER 4 API ROUTE TESTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_api_attack_chains():
    """GET /api/attack-chains should return list."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/attack-chains")
        assert resp.status_code == 200
        data = resp.json()
        assert "chains" in data


@pytest.mark.asyncio
async def test_api_compliance_violations():
    """GET /api/compliance/violations should return list."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/compliance/violations")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_api_compliance_summary():
    """GET /api/compliance/summary should return summary dict."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/compliance/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "open" in data


@pytest.mark.asyncio
async def test_api_recommendations():
    """GET /api/recommendations should return list."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/recommendations")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
