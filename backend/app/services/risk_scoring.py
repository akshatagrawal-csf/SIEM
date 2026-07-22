"""
SIEM Analytics System - Dynamic Risk Scoring Algorithm

Calculates a composite 0-100 risk score for security events by combining:
  1. ML Prediction & Confidence (40% weight)
  2. Rule-based Severity Level (25% weight)
  3. Failed Authentication Frequency (15% weight)
  4. Origin Country Threat Score (10% weight)
  5. Data Exfiltration Volume (10% weight)
"""
import numpy as np


SEVERITY_WEIGHTS = {
    "Critical": 1.0,
    "High": 0.75,
    "Medium": 0.45,
    "Low": 0.15,
}

HIGH_RISK_COUNTRIES = {"CN", "RU", "IR", "KP", "RO"}


def calculate_risk_score(event_dict: dict, ml_prediction: str = "normal", ml_confidence: float = 0.5) -> float:
    """
    Calculate dynamic composite 0–100 risk score for a security event log.

    Returns:
        float: Composite risk score between 0.0 and 100.0
    """
    # 1. ML Component (0–40 points)
    ml_is_mal = 1.0 if ml_prediction == "malicious" else 0.0
    ml_score = ml_is_mal * ml_confidence * 40.0

    # 2. Rule Severity Component (0–25 points)
    severity = event_dict.get("severity", "Low")
    sev_weight = SEVERITY_WEIGHTS.get(severity, 0.15)
    rule_score = sev_weight * 25.0

    # 3. Failed Auth Component (0–15 points)
    failed_attempts = float(event_dict.get("failed_attempts", 0) or 0)
    failed_score = min(15.0, failed_attempts * 3.0)

    # 4. Country Risk Component (0–10 points)
    country = str(event_dict.get("country", "")).upper()
    country_score = 10.0 if country in HIGH_RISK_COUNTRIES else 2.0

    # 5. Data Volume Component (0–10 points)
    bytes_transferred = float(event_dict.get("bytes_transferred", 0) or 0)
    if bytes_transferred > 500_000_000:  # > 500MB
        data_score = 10.0
    elif bytes_transferred > 50_000_000:  # > 50MB
        data_score = 6.0
    elif bytes_transferred > 5_000_000:   # > 5MB
        data_score = 3.0
    else:
        data_score = 0.0

    raw_score = ml_score + rule_score + failed_score + country_score + data_score
    final_score = float(np.clip(raw_score, 0.0, 100.0))

    return round(final_score, 1)


def get_risk_classification(score: float) -> dict:
    """
    Map numerical risk score (0-100) to severity classification and escalation level.
    """
    if score >= 80.0:
        return {
            "severity": "Critical",
            "escalation_level": "Isolate",
            "action": "Immediate isolation required. Block source IP and isolate asset from network.",
        }
    elif score >= 60.0:
        return {
            "severity": "High",
            "escalation_level": "Escalate",
            "action": "Escalate to SOC Tier-2 analyst. Revoke credentials pending investigation.",
        }
    elif score >= 30.0:
        return {
            "severity": "Medium",
            "escalation_level": "Investigate",
            "action": "Investigate user activity logs and verify authentication factor.",
        }
    else:
        return {
            "severity": "Low",
            "escalation_level": "Monitor",
            "action": "Log event for routine compliance audit. No immediate intervention required.",
        }
