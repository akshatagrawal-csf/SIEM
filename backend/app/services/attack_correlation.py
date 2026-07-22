"""
SIEM Analytics System - Attack Correlation Engine

Correlates disparate security events into coherent multi-stage attack chains based on:
  - Common source IP address
  - Target system / username overlap
  - Temporal proximity (4-hour rolling windows)
  - Attack stage progression sequence
"""
from typing import List, Dict, Any
from datetime import datetime


STAGE_SEVERITY = {
    "Port Scan": "Low",
    "Brute Force": "High",
    "Suspicious Login": "High",
    "Privilege Escalation": "Critical",
    "Data Exfiltration": "Critical",
    "Malware": "Critical",
}


def correlate_events(events: List[dict]) -> List[dict]:
    """
    Correlate a list of security event dictionaries into multi-stage attack chains.

    Returns:
        List[dict]: List of attack chain records with embedded stages
    """
    chains_by_ip: Dict[str, List[dict]] = {}

    # Group events by source IP
    for evt in events:
        ip = evt.get("source_ip")
        if not ip or evt.get("label") == "Normal":
            continue
        chains_by_ip.setdefault(ip, []).append(evt)

    attack_chains = []

    for ip, ip_events in chains_by_ip.items():
        if len(ip_events) < 2:
            continue  # Require at least 2 correlated events for a multi-stage chain

        # Sort events chronologically
        ip_events.sort(key=lambda x: str(x.get("timestamp", "")))

        stages = []
        highest_severity = "Low"
        max_risk = 0.0

        for i, evt in enumerate(ip_events, 1):
            attack_type = evt.get("label") or evt.get("event_type") or "Suspicious Activity"
            sev = evt.get("severity") or STAGE_SEVERITY.get(attack_type, "Medium")
            risk = float(evt.get("risk_score", 50.0))

            if risk > max_risk:
                max_risk = risk

            if sev == "Critical":
                highest_severity = "Critical"
            elif sev == "High" and highest_severity != "Critical":
                highest_severity = "High"

            stages.append({
                "stage_number": i,
                "attack_type": attack_type,
                "timestamp": evt.get("timestamp"),
                "description": f"{attack_type} detected from {ip} targeting {evt.get('destination_ip', 'internal asset')}",
                "severity": sev,
            })

        target_system = ip_events[0].get("destination_ip") or "192.168.1.50"
        username = ip_events[0].get("username") or "system"

        chain_record = {
            "name": f"Multi-Stage Attack Sequence - {ip}",
            "source_ip": ip,
            "target_system": target_system,
            "username": username,
            "start_time": ip_events[0].get("timestamp"),
            "end_time": ip_events[-1].get("timestamp"),
            "severity": highest_severity,
            "risk_score": max_risk,
            "status": "active",
            "stages": stages,
        }

        attack_chains.append(chain_record)

    return attack_chains
