"""
SIEM Analytics System - WebSocket Event Stream

Endpoint:
  WS /ws/events  → Streams security events to connected clients in real-time

How it works:
  1. Client connects via WebSocket
  2. Server sends a new event every 2-4 seconds from the database
  3. If no events in DB, it generates a synthetic event on-the-fly
  4. Multiple clients can connect simultaneously

Frontend usage:
  const ws = new WebSocket("ws://localhost:8000/ws/events");
  ws.onmessage = (e) => { const event = JSON.parse(e.data); ... };
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func
import asyncio
import json
import random
import logging
from datetime import datetime, timezone

from app.database import async_session
from app.models import SecurityEvent

router = APIRouter()
logger = logging.getLogger("siem.websocket")

# Track all connected WebSocket clients
connected_clients: list[WebSocket] = []


def generate_live_event() -> dict:
    """Generate a synthetic security event for real-time streaming when DB is empty."""
    event_types = [
        "login_failure", "login_success", "file_access", "network_connection",
        "system_alert", "privilege_change", "data_transfer",
    ]
    severities = ["Low", "Medium", "High", "Critical"]
    severity_weights = [0.40, 0.30, 0.20, 0.10]
    labels = [
        "Normal", "Brute Force", "Port Scan", "Malware",
        "Data Exfiltration", "Suspicious Login", "Privilege Escalation",
    ]
    protocols = ["TCP", "UDP", "SSH", "HTTP", "HTTPS", "DNS", "SMB", "RDP"]
    usernames = [
        "john.doe", "sarah.chen", "mike.wilson", "admin", "root",
        "svc_backup", "alex.kumar", "lisa.park", "devops_bot", "db_admin",
    ]
    countries = ["US", "CN", "RU", "DE", "BR", "IN", "GB", "KR", "JP", "AU"]

    severity = random.choices(severities, weights=severity_weights, k=1)[0]
    risk_score = {
        "Low": random.uniform(5, 29),
        "Medium": random.uniform(30, 59),
        "High": random.uniform(60, 79),
        "Critical": random.uniform(80, 100),
    }[severity]

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": f"{random.choice([10, 172, 192])}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
        "destination_ip": f"192.168.{random.randint(1,10)}.{random.randint(1,254)}",
        "username": random.choice(usernames),
        "event_type": random.choice(event_types),
        "severity": severity,
        "label": random.choice(labels),
        "risk_score": round(risk_score, 1),
        "protocol": random.choice(protocols),
        "destination_port": random.choice([22, 80, 443, 3389, 445, 53, 8080, 3306, 5432]),
        "bytes_transferred": random.randint(64, 5_000_000),
        "country": random.choice(countries),
        "ml_prediction": "malicious" if risk_score > 50 else "normal",
        "ml_confidence": round(random.uniform(0.6, 0.99), 3),
    }


async def get_random_db_event() -> dict | None:
    """Fetch a random event from the database for streaming."""
    try:
        async with async_session() as session:
            count_result = await session.execute(select(func.count(SecurityEvent.id)))
            total = count_result.scalar() or 0

            if total == 0:
                return None

            offset = random.randint(0, total - 1)
            result = await session.execute(
                select(SecurityEvent).offset(offset).limit(1)
            )
            event = result.scalar_one_or_none()

            if not event:
                return None

            return {
                "id": event.id,
                "timestamp": event.timestamp.isoformat() if event.timestamp else datetime.now(timezone.utc).isoformat(),
                "source_ip": event.source_ip,
                "destination_ip": event.destination_ip,
                "username": event.username,
                "event_type": event.event_type,
                "severity": event.severity,
                "label": event.label,
                "risk_score": event.risk_score,
                "protocol": event.protocol,
                "destination_port": event.destination_port,
                "bytes_transferred": event.bytes_transferred,
                "country": event.country,
                "ml_prediction": event.ml_prediction,
                "ml_confidence": event.ml_confidence,
            }
    except Exception as e:
        logger.warning(f"DB event fetch failed, using synthetic: {e}")
        return None


@router.websocket("/events")
async def websocket_event_stream(websocket: WebSocket):
    """
    WebSocket endpoint that streams security events to the client.
    Sends one event every 2-4 seconds.
    """
    await websocket.accept()
    connected_clients.append(websocket)
    client_id = id(websocket)
    logger.info(f"WebSocket client connected: {client_id} (total: {len(connected_clients)})")

    try:
        while True:
            event_data = await get_random_db_event()
            if event_data is None:
                event_data = generate_live_event()

            await websocket.send_text(json.dumps(event_data))
            await asyncio.sleep(random.uniform(2.0, 4.0))

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        logger.info(f"Active WebSocket clients: {len(connected_clients)}")


async def broadcast_event(event_data: dict):
    """
    Broadcast an event to all connected WebSocket clients.
    Call this when a new event is inserted into the database.
    """
    if not connected_clients:
        return

    message = json.dumps(event_data)
    disconnected = []

    for client in connected_clients:
        try:
            await client.send_text(message)
        except Exception:
            disconnected.append(client)

    for client in disconnected:
        connected_clients.remove(client)
