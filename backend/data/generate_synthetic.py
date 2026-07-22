"""
SIEM Analytics System - Synthetic Security Log Generator

Generates 10,000+ realistic enterprise security events and saves them as CSV.
Run standalone:
    cd backend
    python -m data.generate_synthetic

Output: backend/data/raw/security_events.csv
"""
import csv
import os
import random
from datetime import datetime, timedelta, timezone

# ─── Configuration ───────────────────────────────────────
NUM_EVENTS = 10000
DAYS_SPAN = 30
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "raw")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "security_events.csv")

# ─── Realistic Data Pools ────────────────────────────────

INTERNAL_IPS = [
    "10.0.1.15", "10.0.1.23", "10.0.1.45", "10.0.2.10", "10.0.2.88",
    "10.0.3.5", "10.0.3.77", "10.0.5.23", "10.0.5.100", "10.0.8.12",
    "192.168.1.10", "192.168.1.25", "192.168.1.50", "192.168.1.100",
    "192.168.2.5", "192.168.2.30", "192.168.3.15", "192.168.5.200",
    "172.16.0.10", "172.16.0.55", "172.16.1.20", "172.16.2.100",
]

EXTERNAL_ATTACKER_IPS = [
    "45.33.32.156", "103.224.182.250", "185.220.101.33", "91.219.237.229",
    "198.51.100.23", "203.0.113.42", "77.247.181.163", "62.210.105.116",
    "185.56.83.150", "45.155.205.233", "94.102.49.190", "23.129.64.210",
    "116.202.120.166", "178.128.23.9", "139.59.1.145", "167.71.13.196",
]

DEST_IPS = [
    "192.168.1.1", "192.168.1.50", "192.168.1.100", "192.168.2.1",
    "10.0.1.1", "10.0.2.1", "10.0.5.1", "10.0.10.1",
    "172.16.0.1", "172.16.1.1",
]

USERNAMES = [
    "john.doe", "sarah.chen", "mike.wilson", "alex.kumar", "lisa.park",
    "david.smith", "emma.jones", "robert.taylor", "maria.garcia",
    "james.brown", "admin", "root", "svc_backup", "svc_monitor",
    "db_admin", "devops_bot", "jenkins_ci", "nagios_check",
]

EVENT_TYPES = [
    "login_success", "login_failure", "file_access", "network_connection",
    "system_alert", "privilege_change", "data_transfer",
]

PROTOCOLS = ["TCP", "UDP", "SSH", "HTTP", "HTTPS", "FTP", "DNS", "SMB", "RDP", "ICMP"]

COUNTRIES = {
    "internal": ["US", "US", "US", "US"],  # Weighted toward US for internal
    "external": ["CN", "RU", "DE", "BR", "IN", "GB", "KR", "JP", "AU", "IR", "NL", "RO"],
}

DEVICE_TYPES = ["server", "workstation", "firewall", "router", "database", "iot_sensor"]

LABELS = {
    "Normal": 0.55,
    "Brute Force": 0.10,
    "Port Scan": 0.08,
    "Malware": 0.06,
    "Data Exfiltration": 0.06,
    "Suspicious Login": 0.08,
    "Privilege Escalation": 0.07,
}

SEVERITY_MAP = {
    "Normal": "Low",
    "Brute Force": "High",
    "Port Scan": "Medium",
    "Malware": "Critical",
    "Data Exfiltration": "Critical",
    "Suspicious Login": "High",
    "Privilege Escalation": "Critical",
}

ALERT_TYPES = {
    "Normal": None,
    "Brute Force": "Brute Force Detected",
    "Port Scan": "Port Scanning Activity",
    "Malware": "Malware Communication",
    "Data Exfiltration": "Data Exfiltration Alert",
    "Suspicious Login": "Suspicious Login Detected",
    "Privilege Escalation": "Privilege Escalation Alert",
}

RECOMMENDATIONS = {
    "Normal": "No action required. Log for audit.",
    "Brute Force": "Lock account after 5 failed attempts. Enforce MFA. Monitor source IP.",
    "Port Scan": "Block source IP at firewall. Review exposed services. Enable IDS rules.",
    "Malware": "Isolate affected host immediately. Run full AV scan. Check C2 communication.",
    "Data Exfiltration": "Block data transfer. Investigate user activity. Preserve forensic evidence.",
    "Suspicious Login": "Verify user identity. Check login location/time. Enable step-up auth.",
    "Privilege Escalation": "Revoke elevated privileges. Audit all actions taken. Review access policies.",
}


def generate_timestamp(base_time: datetime, day_offset: int) -> datetime:
    """Generate a realistic timestamp within a given day."""
    hour = random.choices(
        range(24),
        weights=[1,1,1,1,1,2,3,5,8,9,9,8,7,7,8,9,8,6,4,3,2,2,1,1],  # Business hours weighted
        k=1
    )[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return base_time - timedelta(days=day_offset, hours=-hour, minutes=-minute, seconds=-second)


def generate_event(event_id: int, base_time: datetime) -> dict:
    """Generate a single realistic security event."""
    # Pick label with weighted distribution
    label = random.choices(
        list(LABELS.keys()),
        weights=list(LABELS.values()),
        k=1
    )[0]

    severity = SEVERITY_MAP[label]
    is_attack = label != "Normal"
    day_offset = random.randint(0, DAYS_SPAN - 1)
    timestamp = generate_timestamp(base_time, day_offset)

    # Source IP: attacks come from external IPs more often
    if is_attack and random.random() > 0.3:
        source_ip = random.choice(EXTERNAL_ATTACKER_IPS)
        country = random.choice(COUNTRIES["external"])
    else:
        source_ip = random.choice(INTERNAL_IPS)
        country = random.choice(COUNTRIES["internal"])

    destination_ip = random.choice(DEST_IPS)
    username = random.choice(USERNAMES)

    # Event type based on label
    if label == "Brute Force":
        event_type = "login_failure"
    elif label == "Port Scan":
        event_type = "network_connection"
    elif label == "Data Exfiltration":
        event_type = "data_transfer"
    elif label == "Suspicious Login":
        event_type = random.choice(["login_success", "login_failure"])
    elif label == "Privilege Escalation":
        event_type = "privilege_change"
    elif label == "Malware":
        event_type = "network_connection"
    else:
        event_type = random.choice(EVENT_TYPES)

    # Login status
    if event_type in ("login_success", "login_failure"):
        login_status = "success" if event_type == "login_success" else "failure"
    else:
        login_status = ""

    # Failed attempts
    if label == "Brute Force":
        failed_attempts = random.randint(5, 50)
    elif event_type == "login_failure":
        failed_attempts = random.randint(1, 4)
    else:
        failed_attempts = 0

    # Destination port
    if label == "Port Scan":
        destination_port = random.randint(1, 65535)
    elif label == "Malware":
        destination_port = random.choice([4444, 5555, 6666, 8443, 9090])
    else:
        destination_port = random.choice([22, 80, 443, 3389, 445, 53, 8080, 3306, 5432, 25])

    protocol = random.choice(PROTOCOLS)

    # Bytes transferred
    if label == "Data Exfiltration":
        bytes_transferred = random.randint(500_000_000, 5_000_000_000)  # 500MB - 5GB
    elif event_type == "data_transfer":
        bytes_transferred = random.randint(1_000, 100_000_000)
    else:
        bytes_transferred = random.randint(64, 50_000)

    device_type = random.choice(DEVICE_TYPES)

    # Risk score
    risk_base = {"Low": 10, "Medium": 40, "High": 65, "Critical": 85}[severity]
    risk_score = min(100, max(0, risk_base + random.randint(-10, 15)))

    # ML prediction
    if is_attack:
        ml_prediction = "malicious" if random.random() > 0.05 else "normal"  # 95% recall
        ml_confidence = round(random.uniform(0.70, 0.99), 3)
    else:
        ml_prediction = "normal" if random.random() > 0.03 else "malicious"  # 3% FP
        ml_confidence = round(random.uniform(0.75, 0.99), 3)

    # Rule triggered
    rule_triggered = ""
    if label == "Brute Force":
        rule_triggered = "RULE-001: Brute Force Detection"
    elif label == "Port Scan":
        rule_triggered = "RULE-002: Port Scan Detection"
    elif label == "Data Exfiltration":
        rule_triggered = "RULE-003: Data Exfiltration Detection"
    elif label == "Suspicious Login":
        rule_triggered = "RULE-004: Suspicious Login Detection"
    elif label == "Privilege Escalation":
        rule_triggered = "RULE-005: Privilege Escalation Detection"
    elif label == "Malware":
        rule_triggered = "RULE-006: Malware Communication Detection"

    escalation = severity in ("High", "Critical") and random.random() > 0.3

    return {
        "id": event_id,
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "source_ip": source_ip,
        "destination_ip": destination_ip,
        "username": username,
        "event_type": event_type,
        "login_status": login_status,
        "failed_attempts": failed_attempts,
        "destination_port": destination_port,
        "protocol": protocol,
        "bytes_transferred": bytes_transferred,
        "device_type": device_type,
        "country": country,
        "alert_type": ALERT_TYPES.get(label, ""),
        "severity": severity,
        "label": label,
        "risk_score": risk_score,
        "ml_prediction": ml_prediction,
        "ml_confidence": ml_confidence,
        "rule_triggered": rule_triggered,
        "recommendation": RECOMMENDATIONS.get(label, ""),
        "escalation": escalation,
    }


def generate_attack_chains(events: list[dict]) -> list[dict]:
    """
    Generate 5 realistic multi-stage attack chain records from the event data.
    Returns a list of chain dicts with embedded stages.
    """
    chains = [
        {
            "name": "APT - Internal Server Compromise",
            "source_ip": "45.33.32.156",
            "target_system": "192.168.1.50",
            "username": "svc_backup",
            "severity": "Critical",
            "risk_score": 95,
            "stages": [
                {"stage": 1, "type": "Port Scan", "desc": "Reconnaissance scan on ports 1-1024", "severity": "Low"},
                {"stage": 2, "type": "Brute Force", "desc": "47 failed SSH login attempts on svc_backup", "severity": "High"},
                {"stage": 3, "type": "Suspicious Login", "desc": "Successful login from external IP at 02:30 UTC", "severity": "High"},
                {"stage": 4, "type": "Privilege Escalation", "desc": "svc_backup elevated to root via sudo exploit", "severity": "Critical"},
                {"stage": 5, "type": "Data Exfiltration", "desc": "2.3GB transferred to 45.33.32.156 over HTTPS", "severity": "Critical"},
            ],
        },
        {
            "name": "Lateral Movement - Finance Department",
            "source_ip": "103.224.182.250",
            "target_system": "10.0.2.10",
            "username": "john.doe",
            "severity": "High",
            "risk_score": 82,
            "stages": [
                {"stage": 1, "type": "Suspicious Login", "desc": "Login from unrecognized country (CN)", "severity": "Medium"},
                {"stage": 2, "type": "Port Scan", "desc": "Internal network scan from john.doe workstation", "severity": "Medium"},
                {"stage": 3, "type": "Privilege Escalation", "desc": "Attempted access to finance share with stolen creds", "severity": "High"},
                {"stage": 4, "type": "Data Exfiltration", "desc": "800MB zip file uploaded to cloud storage", "severity": "High"},
            ],
        },
        {
            "name": "Ransomware Deployment Attempt",
            "source_ip": "185.220.101.33",
            "target_system": "10.0.1.45",
            "username": "admin",
            "severity": "Critical",
            "risk_score": 98,
            "stages": [
                {"stage": 1, "type": "Brute Force", "desc": "122 RDP login attempts against admin account", "severity": "High"},
                {"stage": 2, "type": "Suspicious Login", "desc": "Admin login from TOR exit node at 03:15 UTC", "severity": "Critical"},
                {"stage": 3, "type": "Malware", "desc": "Connection to known C2 server on port 4444", "severity": "Critical"},
                {"stage": 4, "type": "Privilege Escalation", "desc": "Disabled Windows Defender via PowerShell", "severity": "Critical"},
                {"stage": 5, "type": "Malware", "desc": "Ransomware payload deployed to network shares", "severity": "Critical"},
            ],
        },
        {
            "name": "Insider Threat - Database Exfiltration",
            "source_ip": "10.0.3.77",
            "target_system": "172.16.2.100",
            "username": "db_admin",
            "severity": "High",
            "risk_score": 78,
            "stages": [
                {"stage": 1, "type": "Suspicious Login", "desc": "db_admin login at 23:45 outside business hours", "severity": "Medium"},
                {"stage": 2, "type": "Privilege Escalation", "desc": "Granted self DBA role on production database", "severity": "High"},
                {"stage": 3, "type": "Data Exfiltration", "desc": "Full customer table exported (1.2M records)", "severity": "High"},
            ],
        },
        {
            "name": "Supply Chain - CI/CD Pipeline Compromise",
            "source_ip": "91.219.237.229",
            "target_system": "10.0.5.100",
            "username": "jenkins_ci",
            "severity": "Critical",
            "risk_score": 91,
            "stages": [
                {"stage": 1, "type": "Brute Force", "desc": "Credential stuffing against Jenkins API", "severity": "Medium"},
                {"stage": 2, "type": "Suspicious Login", "desc": "jenkins_ci API token used from external IP", "severity": "High"},
                {"stage": 3, "type": "Malware", "desc": "Malicious build step injected into pipeline", "severity": "Critical"},
                {"stage": 4, "type": "Data Exfiltration", "desc": "Source code and secrets exfiltrated", "severity": "Critical"},
            ],
        },
    ]

    base_time = datetime.now(timezone.utc)
    result = []
    for i, chain in enumerate(chains):
        hours_offset = random.randint(i * 48, (i + 1) * 48)
        start = base_time - timedelta(hours=hours_offset + len(chain["stages"]) * 2)
        end = base_time - timedelta(hours=hours_offset)

        chain_record = {
            "id": i + 1,
            "name": chain["name"],
            "source_ip": chain["source_ip"],
            "target_system": chain["target_system"],
            "username": chain["username"],
            "start_time": start.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": end.strftime("%Y-%m-%d %H:%M:%S"),
            "severity": chain["severity"],
            "risk_score": chain["risk_score"],
            "status": random.choice(["active", "contained", "resolved"]),
            "stages": [],
        }

        for j, stage in enumerate(chain["stages"]):
            stage_time = start + timedelta(hours=j * 2 + random.uniform(0, 1))
            chain_record["stages"].append({
                "stage_number": stage["stage"],
                "attack_type": stage["type"],
                "timestamp": stage_time.strftime("%Y-%m-%d %H:%M:%S"),
                "description": stage["desc"],
                "severity": stage["severity"],
            })

        result.append(chain_record)

    return result


def main():
    """Generate all synthetic data and save to CSV files."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    base_time = datetime.now(timezone.utc)
    print(f"[*] Generating {NUM_EVENTS} synthetic security events...")

    events = [generate_event(i + 1, base_time) for i in range(NUM_EVENTS)]

    # Sort by timestamp
    events.sort(key=lambda e: e["timestamp"])

    # Write events CSV
    fieldnames = list(events[0].keys())
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(events)

    print(f"[OK] Saved {len(events)} events to {OUTPUT_FILE}")

    # Stats
    label_counts = {}
    for e in events:
        label_counts[e["label"]] = label_counts.get(e["label"], 0) + 1

    print("\n[STATS] Label Distribution:")
    for label, count in sorted(label_counts.items(), key=lambda x: -x[1]):
        pct = count / len(events) * 100
        print(f"   {label:25s} -> {count:5d} ({pct:.1f}%)")

    severity_counts = {}
    for e in events:
        severity_counts[e["severity"]] = severity_counts.get(e["severity"], 0) + 1

    print("\n[STATS] Severity Distribution:")
    for sev, count in sorted(severity_counts.items(), key=lambda x: -x[1]):
        pct = count / len(events) * 100
        print(f"   {sev:10s} -> {count:5d} ({pct:.1f}%)")

    # Generate attack chains and save as JSON
    chains = generate_attack_chains(events)
    import json
    chains_file = os.path.join(OUTPUT_DIR, "attack_chains.json")
    with open(chains_file, "w", encoding="utf-8") as f:
        json.dump(chains, f, indent=2)
    print(f"\n[OK] Saved {len(chains)} attack chains to {chains_file}")

    print("\n[DONE] Generation complete!")


if __name__ == "__main__":
    main()
