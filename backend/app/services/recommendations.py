"""
SIEM Analytics System - Incident Recommendation Engine

Maps threat events, risk scores, and attack types to actionable remediation playbooks.
"""
from typing import Dict, Any, List


RECOMMENDATION_PLAYBOOKS = {
    "Brute Force": {
        "reason": "Automated login failure burst detected indicating credential stuffing or dictionary attack.",
        "recommendation": "Lock target account immediately. Enforce Multi-Factor Authentication (MFA) step-up. Add source IP to firewall blocklist.",
        "actions": ["Lock Account", "Enforce MFA", "Block IP"],
    },
    "Port Scan": {
        "reason": "Hostile IP scanning multiple network ports to discover active services and vulnerabilities.",
        "recommendation": "Block source IP at ingress firewall. Audit exposed perimeter services and restrict unused port ranges.",
        "actions": ["Firewall Block", "Audit Ports", "Enable IDS Rule"],
    },
    "Malware": {
        "reason": "Outbound connection attempt to known Command & Control (C2) infrastructure or malware port.",
        "recommendation": "Isolate host machine from internal network immediately. Run EDR forensic scan. Revoke compromised active directory tokens.",
        "actions": ["Isolate Host", "EDR Scan", "Revoke Tokens"],
    },
    "Data Exfiltration": {
        "reason": "Anomalous large outbound data transfer exceeding baseline volume threshold.",
        "recommendation": "Terminate active network session. Block egress gateway IP. Preserve memory image for forensic analysis.",
        "actions": ["Terminate Session", "Block Egress", "Forensic Capture"],
    },
    "Suspicious Login": {
        "reason": "Authentication event from high-risk country or impossible travel velocity.",
        "recommendation": "Require identity verification via out-of-band communication. Terminate active sessions for username.",
        "actions": ["Verify Identity", "Kill Sessions", "Reset Password"],
    },
    "Privilege Escalation": {
        "reason": "Unauthorized account privilege elevation or admin group membership modification.",
        "recommendation": "Revert account privileges to baseline state. Audit all actions executed during elevated window.",
        "actions": ["Revert Privileges", "Audit Session", "Notify Admin"],
    },
}


def generate_recommendation(event_dict: dict, risk_score: float) -> dict:
    """
    Generate incident response recommendation dict for a given event.

    Returns:
        dict: Recommendation payload
    """
    attack_type = event_dict.get("label") or event_dict.get("event_type") or "Suspicious Activity"
    playbook = RECOMMENDATION_PLAYBOOKS.get(attack_type, {
        "reason": f"Anomalous activity detected with risk score {risk_score:.1f}.",
        "recommendation": "Investigate security event telemetry. Review user session logs and verify network connection origin.",
        "actions": ["Review Telemetry", "Verify User"],
    })

    if risk_score >= 80.0:
        escalation_level = "Isolate"
    elif risk_score >= 60.0:
        escalation_level = "Escalate"
    elif risk_score >= 30.0:
        escalation_level = "Investigate"
    else:
        escalation_level = "Monitor"

    return {
        "source_ip": event_dict.get("source_ip"),
        "username": event_dict.get("username"),
        "attack_type": attack_type,
        "severity": event_dict.get("severity", "Medium"),
        "risk_score": risk_score,
        "reason": playbook["reason"],
        "recommendation": playbook["recommendation"],
        "escalation_level": escalation_level,
        "specific_actions": playbook["actions"],
        "status": "pending",
    }
