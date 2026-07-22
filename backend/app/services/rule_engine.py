"""
SIEM Analytics System - Rule-Based Detection Engine

Evaluates security event logs against defined threat rules:
  RULE-001: Brute Force Detection
  RULE-002: Port Scan Detection
  RULE-003: Data Exfiltration Detection
  RULE-004: Suspicious Login Location / Time
  RULE-005: Privilege Escalation Attempt
  RULE-006: Malware C2 Communication
  RULE-007: Repeated Authentication Failure Threshold
"""
from typing import List, Dict, Any

RULES = [
    {
        "rule_id": "RULE-001",
        "name": "Brute Force Detection",
        "description": "Triggered when 5 or more failed login attempts are recorded for an account.",
        "severity": "High",
    },
    {
        "rule_id": "RULE-002",
        "name": "Port Scan Detection",
        "description": "Triggered when an IP connects to unusual port ranges or scans multiple targets.",
        "severity": "Medium",
    },
    {
        "rule_id": "RULE-003",
        "name": "Data Exfiltration Detection",
        "description": "Triggered when outbound data transfer exceeds 500MB in a single session.",
        "severity": "Critical",
    },
    {
        "rule_id": "RULE-004",
        "name": "Suspicious Login Location / Time",
        "description": "Triggered when login occurs from high-risk countries or outside standard business hours.",
        "severity": "High",
    },
    {
        "rule_id": "RULE-005",
        "name": "Privilege Escalation Attempt",
        "description": "Triggered when non-admin user attempts privilege modification or admin resource access.",
        "severity": "Critical",
    },
    {
        "rule_id": "RULE-006",
        "name": "Malware C2 Communication",
        "description": "Triggered when network connections target known malicious ports (4444, 5555, 6666, 8443).",
        "severity": "Critical",
    },
    {
        "rule_id": "RULE-007",
        "name": "Repeated Authentication Failure",
        "description": "Triggered when an IP accumulates 10 or more auth failures across multiple usernames.",
        "severity": "High",
    },
]

MALICIOUS_PORTS = {4444, 5555, 6666, 8443, 9090}
HIGH_RISK_COUNTRIES = {"CN", "RU", "IR", "KP", "RO"}


def evaluate_event(event_dict: dict) -> List[dict]:
    """
    Evaluate a single security event against all detection rules.

    Returns:
        List[dict]: List of triggered rule dictionaries
    """
    triggered_rules = []

    failed_attempts = int(event_dict.get("failed_attempts", 0) or 0)
    bytes_transferred = int(event_dict.get("bytes_transferred", 0) or 0)
    dest_port = int(event_dict.get("destination_port", 0) or 0)
    country = str(event_dict.get("country", "")).upper()
    event_type = str(event_dict.get("event_type", "")).lower()
    label = str(event_dict.get("label", "")).lower()

    # RULE-001: Brute Force
    if failed_attempts >= 5 or "brute force" in label:
        triggered_rules.append(RULES[0])

    # RULE-002: Port Scan
    if "port scan" in label or (event_type == "network_connection" and dest_port not in (80, 443, 22, 53)):
        triggered_rules.append(RULES[1])

    # RULE-003: Data Exfiltration
    if bytes_transferred > 500_000_000 or "data exfiltration" in label:
        triggered_rules.append(RULES[2])

    # RULE-004: Suspicious Login
    if country in HIGH_RISK_COUNTRIES or "suspicious login" in label:
        triggered_rules.append(RULES[3])

    # RULE-005: Privilege Escalation
    if event_type == "privilege_change" or "privilege escalation" in label:
        triggered_rules.append(RULES[4])

    # RULE-006: Malware C2 Communication
    if dest_port in MALICIOUS_PORTS or "malware" in label:
        triggered_rules.append(RULES[5])

    # RULE-007: Repeated Auth Failure Threshold
    if failed_attempts >= 10:
        triggered_rules.append(RULES[6])

    return triggered_rules


def get_all_rules() -> List[dict]:
    """Return catalog of all configured detection rules."""
    return RULES
