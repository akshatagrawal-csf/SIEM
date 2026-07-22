"""
SIEM Analytics System - ML Unit Tests

Tests cover:
  - Feature extraction from security event dicts
  - ML model predictions and confidence scoring
  - Dynamic composite risk score calculation
  - ML API endpoints (/api/ml/predict, /performance, /feature-importance)
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from ml.feature_engineering import extract_features_single
from app.services.risk_scoring import calculate_risk_score, get_risk_classification
from app.services.ml_service import predict_event, get_feature_importances


def test_feature_extraction():
    """Verify single event feature vector dimensions and calculations."""
    event = {
        "failed_attempts": 12,
        "destination_port": 22,
        "bytes_transferred": 100000,
        "country": "RU",
        "event_type": "login_failure",
        "protocol": "SSH",
        "device_type": "server",
    }
    feats = extract_features_single(event)
    assert len(feats) == 8
    assert feats[0] == 12.0  # failed_attempts
    assert feats[3] == 3.5   # RU country risk score
    assert feats[7] == 1.0   # is_failed_login


def test_risk_scoring_critical():
    """Verify high-threat event results in Critical risk score (>80)."""
    critical_event = {
        "severity": "Critical",
        "failed_attempts": 25,
        "country": "RU",
        "bytes_transferred": 600_000_000,
    }
    score = calculate_risk_score(critical_event, ml_prediction="malicious", ml_confidence=0.95)
    assert score >= 80.0
    classification = get_risk_classification(score)
    assert classification["severity"] == "Critical"
    assert classification["escalation_level"] == "Isolate"


def test_risk_scoring_low():
    """Verify normal event results in Low risk score (<30)."""
    low_event = {
        "severity": "Low",
        "failed_attempts": 0,
        "country": "US",
        "bytes_transferred": 1024,
    }
    score = calculate_risk_score(low_event, ml_prediction="normal", ml_confidence=0.95)
    assert score < 30.0
    classification = get_risk_classification(score)
    assert classification["severity"] == "Low"
    assert classification["escalation_level"] == "Monitor"


def test_ml_prediction_service():
    """Verify ML predict service returns correct dict structure."""
    event = {
        "failed_attempts": 10,
        "destination_port": 22,
        "event_type": "login_failure",
        "country": "CN",
    }
    result = predict_event(event, model_name="Random Forest")
    assert "prediction" in result
    assert result["prediction"] in ("malicious", "normal")
    assert 0.0 <= result["confidence"] <= 1.0


def test_feature_importances():
    """Verify feature importances returns ranked features."""
    importances = get_feature_importances()
    assert len(importances) == 8
    assert "feature" in importances[0]
    assert "importance" in importances[0]


# ═══════════════════════════════════════════
# ML API ENDPOINT TESTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_api_ml_predict():
    """POST /api/ml/predict should return prediction and risk score."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/ml/predict", json={
            "source_ip": "45.33.32.156",
            "destination_ip": "192.168.1.50",
            "event_type": "login_failure",
            "failed_attempts": 15,
            "destination_port": 22,
            "protocol": "SSH",
            "country": "RU",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "prediction" in data
        assert "confidence" in data
        assert "risk_score" in data
        assert data["prediction"] in ("malicious", "normal")


@pytest.mark.asyncio
async def test_api_ml_performance():
    """GET /api/ml/performance should return model metrics."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/ml/performance")
        assert resp.status_code == 200
        data = resp.json()
        assert "models" in data
        assert len(data["models"]) >= 3


@pytest.mark.asyncio
async def test_api_ml_feature_importance():
    """GET /api/ml/feature-importance should return list."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/ml/feature-importance")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 8
