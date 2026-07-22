"""
SIEM Analytics System - Compliance Monitoring Engine

Evaluates security event telemetry against regulatory compliance frameworks:
  - ISO-27001 (Access Control A.9, Logging A.12.4)
  - SOC2 (Access Control CC6.1, System Ops CC7.2)
  - PCI-DSS (Data Encryption 4.1, Authentication 8.2)
"""
from typing import List, Dict, Any

COMPLIANCE_POLICIES = {
    "After-Hours Access": {
        "policy": "ISO-27001 A.9 (Access Control)",
        "description": "User login recorded outside standard business operating hours (08:00 - 18:00 local time).",
        "severity": "Medium",
    },
    "Unauthorized Access": {
        "policy": "SOC2 CC6.1 (Logical Access)",
        "description": "Attempted access to restricted administrative system or sensitive resource without permission.",
        "severity": "High",
    },
    "Unencrypted Transfer": {
        "policy": "PCI-DSS 4.1 (Data Protection)",
        "description": "Transmission of sensitive data over unencrypted legacy protocols (HTTP, FTP, Telnet).",
        "severity": "High",
    },
    "Failed Auth Threshold": {
        "policy": "ISO-27001 A.9.4 (Password Management)",
        "description": "Multiple consecutive authentication failures detected exceeding regulatory threshold.",
        "severity": "Critical",
    },
    "Password Policy Violation": {
        "policy": "SOC2 CC6.1 (Credential Hygiene)",
        "description": "User account password expired or failed complexity compliance rules.",
        "severity": "Low",
    },
    "Excessive Privileges": {
        "policy": "ISO-27001 A.9.2 (User Provisioning)",
        "description": "User granted administrative privileges exceeding principle of least privilege.",
        "severity": "Critical",
    },
}

UNENCRYPTED_PROTOCOLS = {"HTTP", "FTP", "TELNET"}


def evaluate_compliance(event_dict: dict) -> List[dict]:
    """
    Evaluate a security log event for compliance policy breaches.

    Returns:
        List[dict]: List of compliance violation dicts
    """
    violations = []

    protocol = str(event_dict.get("protocol", "")).upper()
    bytes_trans = int(event_dict.get("bytes_transferred", 0) or 0)
    failed_attempts = int(event_dict.get("failed_attempts", 0) or 0)
    event_type = str(event_dict.get("event_type", "")).lower()

    # Unencrypted Transfer Breach
    if protocol in UNENCRYPTED_PROTOCOLS and bytes_trans > 1_000_000:
        meta = COMPLIANCE_POLICIES["Unencrypted Transfer"]
        violations.append({
            "violation_type": "Unencrypted Transfer",
            "policy": meta["policy"],
            "description": f"Transferred {bytes_trans / 1e6:.1f}MB over unencrypted {protocol} protocol",
            "severity": meta["severity"],
        })

    # Failed Auth Threshold Breach
    if failed_attempts >= 10:
        meta = COMPLIANCE_POLICIES["Failed Auth Threshold"]
        violations.append({
            "violation_type": "Failed Auth Threshold",
            "policy": meta["policy"],
            "description": f"Accumulated {failed_attempts} failed login attempts in short interval",
            "severity": meta["severity"],
        })

    # Excessive Privileges Breach
    if event_type == "privilege_change":
        meta = COMPLIANCE_POLICIES["Excessive Privileges"]
        violations.append({
            "violation_type": "Excessive Privileges",
            "policy": meta["policy"],
            "description": f"User {event_dict.get('username', 'unknown')} modified role permissions",
            "severity": meta["severity"],
        })

    return violations
