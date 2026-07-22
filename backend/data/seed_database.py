"""
SIEM Analytics System - Database Seeder

Loads generated CSV data into the database (SQLite or PostgreSQL).
Run standalone:
    cd backend
    python -m data.seed_database

Prerequisites:
    Run generate_synthetic.py first to create the CSV files.
"""
import csv
import json
import os
import sys
import asyncio
import logging
from datetime import datetime

# Add backend root to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import engine, async_session, Base
from app.models import (
    SecurityEvent, AttackChain, AttackChainStage,
    ComplianceViolation, IncidentRecommendation, MLModelMetric, User,
)
from app.auth import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("siem.seeder")

DATA_DIR = os.path.join(os.path.dirname(__file__), "raw")
EVENTS_CSV = os.path.join(DATA_DIR, "security_events.csv")
CHAINS_JSON = os.path.join(DATA_DIR, "attack_chains.json")


def parse_bool(val: str) -> bool:
    """Parse boolean from CSV string."""
    return str(val).strip().lower() in ("true", "1", "yes")


def parse_int(val: str, default: int = 0) -> int:
    """Safe integer parse."""
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def parse_float(val: str, default: float = 0.0) -> float:
    """Safe float parse."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def parse_datetime(val: str) -> datetime | None:
    """Parse datetime from ISO or common formats."""
    if not val or not val.strip():
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(val.strip(), fmt)
        except ValueError:
            continue
    return None


async def seed_events(session):
    """Load security events from CSV."""
    if not os.path.exists(EVENTS_CSV):
        logger.error(f"[ERROR] Events CSV not found: {EVENTS_CSV}")
        logger.info("   Run first: python -m data.generate_synthetic")
        return 0

    count = 0
    with open(EVENTS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        batch = []

        for row in reader:
            event = SecurityEvent(
                timestamp=parse_datetime(row.get("timestamp", "")),
                source_ip=row.get("source_ip", "0.0.0.0"),
                destination_ip=row.get("destination_ip", ""),
                username=row.get("username", ""),
                event_type=row.get("event_type", "unknown"),
                login_status=row.get("login_status", ""),
                failed_attempts=parse_int(row.get("failed_attempts", "0")),
                destination_port=parse_int(row.get("destination_port", "0")),
                protocol=row.get("protocol", ""),
                bytes_transferred=parse_int(row.get("bytes_transferred", "0")),
                device_type=row.get("device_type", ""),
                country=row.get("country", ""),
                alert_type=row.get("alert_type", ""),
                severity=row.get("severity", "Low"),
                label=row.get("label", "Normal"),
                risk_score=parse_float(row.get("risk_score", "0")),
                ml_prediction=row.get("ml_prediction", "normal"),
                ml_confidence=parse_float(row.get("ml_confidence", "0")),
                rule_triggered=row.get("rule_triggered", ""),
                recommendation=row.get("recommendation", ""),
                escalation=parse_bool(row.get("escalation", "False")),
            )
            batch.append(event)
            count += 1

            # Batch insert every 500 rows for performance
            if len(batch) >= 500:
                session.add_all(batch)
                await session.flush()
                batch = []
                logger.info(f"   Inserted {count} events...")

        # Insert remaining
        if batch:
            session.add_all(batch)
            await session.flush()

    logger.info(f"[OK] Loaded {count} security events")
    return count


async def seed_attack_chains(session):
    """Load attack chains from JSON."""
    if not os.path.exists(CHAINS_JSON):
        logger.warning(f"[WARN] Attack chains JSON not found: {CHAINS_JSON}")
        return 0

    with open(CHAINS_JSON, "r", encoding="utf-8") as f:
        chains_data = json.load(f)

    count = 0
    for chain_data in chains_data:
        chain = AttackChain(
            name=chain_data["name"],
            source_ip=chain_data["source_ip"],
            target_system=chain_data["target_system"],
            username=chain_data["username"],
            start_time=parse_datetime(chain_data["start_time"]),
            end_time=parse_datetime(chain_data["end_time"]),
            severity=chain_data["severity"],
            risk_score=chain_data["risk_score"],
            status=chain_data.get("status", "active"),
        )
        session.add(chain)
        await session.flush()

        # Add stages
        for stage_data in chain_data.get("stages", []):
            stage = AttackChainStage(
                chain_id=chain.id,
                stage_number=stage_data["stage_number"],
                attack_type=stage_data["attack_type"],
                timestamp=parse_datetime(stage_data["timestamp"]),
                description=stage_data["description"],
                severity=stage_data["severity"],
            )
            session.add(stage)

        count += 1

    await session.flush()
    logger.info(f"[OK] Loaded {count} attack chains with stages")
    return count


async def seed_compliance_violations(session):
    """Generate and insert sample compliance violations."""
    import random

    violations = [
        ("After-Hours Access", "john.doe", "10.0.1.15", "Login at 23:45 outside business hours", "ISO-27001 A.9", "Medium"),
        ("Unauthorized Access", "svc_backup", "10.0.5.23", "Service account accessed admin console", "SOC2 CC6.1", "High"),
        ("Unencrypted Transfer", "alex.kumar", "192.168.1.25", "500MB transferred over FTP (unencrypted)", "PCI-DSS 4.1", "High"),
        ("Failed Auth Threshold", "45.33.32.156", "45.33.32.156", "52 failed login attempts in 10 minutes", "ISO-27001 A.9.4", "Critical"),
        ("Password Policy", "mike.wilson", "10.0.2.88", "Password unchanged for 120+ days", "SOC2 CC6.1", "Low"),
        ("Excessive Privileges", "db_admin", "172.16.2.100", "DBA granted self sysadmin role", "ISO-27001 A.9.2", "Critical"),
        ("Data Retention", "devops_bot", "10.0.5.100", "Logs older than 90 days not archived", "SOC2 CC7.2", "Medium"),
        ("After-Hours Access", "sarah.chen", "10.0.1.23", "VPN login from Brazil at 02:00 UTC", "ISO-27001 A.9", "High"),
        ("Unencrypted Transfer", "root", "192.168.1.50", "Database dump sent over HTTP", "PCI-DSS 4.1", "Critical"),
        ("Unauthorized Access", "jenkins_ci", "10.0.5.100", "CI bot accessed production secrets store", "SOC2 CC6.3", "High"),
    ]

    base_time = datetime.utcnow()
    for i, (vtype, user, ip, desc, policy, sev) in enumerate(violations):
        from datetime import timedelta
        v = ComplianceViolation(
            timestamp=base_time - timedelta(days=random.randint(0, 25), hours=random.randint(0, 23)),
            violation_type=vtype,
            username=user,
            source_ip=ip,
            description=desc,
            policy=policy,
            severity=sev,
            status=random.choice(["open", "investigating", "resolved"]),
        )
        session.add(v)

    await session.flush()
    logger.info(f"[OK] Loaded {len(violations)} compliance violations")
    return len(violations)


async def seed_ml_metrics(session):
    """Insert ML model performance metrics."""
    models = [
        MLModelMetric(model_name="Random Forest", accuracy=0.943, precision_score=0.921, recall=0.967, f1_score=0.944, is_active=True),
        MLModelMetric(model_name="Decision Tree", accuracy=0.882, precision_score=0.854, recall=0.901, f1_score=0.877, is_active=False),
        MLModelMetric(model_name="Logistic Regression", accuracy=0.824, precision_score=0.798, recall=0.841, f1_score=0.819, is_active=False),
    ]
    session.add_all(models)
    await session.flush()
    logger.info(f"[OK] Loaded {len(models)} ML model metrics")
    return len(models)


async def seed_default_users(session):
    """Create default admin and analyst accounts."""
    users = [
        User(username="admin", password_hash=hash_password("admin123"), role="admin"),
        User(username="analyst", password_hash=hash_password("analyst123"), role="analyst"),
        User(username="manager", password_hash=hash_password("manager123"), role="manager"),
    ]
    session.add_all(users)
    await session.flush()
    logger.info(f"[OK] Created {len(users)} default user accounts")
    logger.info("   admin/admin123 | analyst/analyst123 | manager/manager123")
    return len(users)


async def main():
    """Main seeder entry point."""
    logger.info("SIEM Database Seeder")
    logger.info("=" * 50)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    logger.info("[OK] Database tables created (fresh)")

    async with async_session() as session:
        async with session.begin():
            await seed_default_users(session)
            events_count = await seed_events(session)
            chains_count = await seed_attack_chains(session)
            violations_count = await seed_compliance_violations(session)
            ml_count = await seed_ml_metrics(session)

        await session.commit()

    logger.info("=" * 50)
    logger.info("[DONE] Seeding complete!")
    logger.info(f"   Events: {events_count}")
    logger.info(f"   Attack Chains: {chains_count}")
    logger.info(f"   Compliance Violations: {violations_count}")
    logger.info(f"   ML Models: {ml_count}")
    logger.info(f"   Default Users: 3")


if __name__ == "__main__":
    asyncio.run(main())
