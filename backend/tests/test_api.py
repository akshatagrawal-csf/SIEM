"""
SIEM Analytics System - API Tests

Run with:
    cd backend
    python -m pytest tests/test_api.py -v

Tests cover:
  - Health check
  - User registration & login (JWT)
  - Event listing, stats, detail
  - Threat analytics endpoints
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before test run."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.fixture
async def client():
    """Async HTTP client for testing FastAPI."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ═══════════════════════════════════════════
# SYSTEM ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_root(client):
    """GET / should return API info."""
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "SIEM Analytics API"
    assert data["status"] == "online"


@pytest.mark.asyncio
async def test_health(client):
    """GET /health should return healthy status."""
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


# ═══════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_register_user(client):
    """POST /api/auth/register should create a new user."""
    import uuid
    uname = f"test_user_{uuid.uuid4().hex[:6]}"
    resp = await client.post("/api/auth/register", json={
        "username": uname,
        "password": "TestPass123",
        "role": "analyst",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == uname
    assert data["role"] == "analyst"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate(client):
    """POST /api/auth/register with existing username should return 409."""
    await client.post("/api/auth/register", json={
        "username": "dup_user",
        "password": "TestPass123",
        "role": "analyst",
    })
    resp = await client.post("/api/auth/register", json={
        "username": "dup_user",
        "password": "TestPass456",
        "role": "analyst",
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_invalid_role(client):
    """POST /api/auth/register with bad role should return 400."""
    resp = await client.post("/api/auth/register", json={
        "username": "bad_role_user",
        "password": "TestPass123",
        "role": "superadmin",
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client):
    """POST /api/auth/login with correct creds should return JWT token."""
    await client.post("/api/auth/register", json={
        "username": "login_test",
        "password": "SecurePass123",
        "role": "analyst",
    })
    resp = await client.post("/api/auth/login", json={
        "username": "login_test",
        "password": "SecurePass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "login_test"
    assert data["role"] == "analyst"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """POST /api/auth/login with wrong password should return 401."""
    resp = await client.post("/api/auth/login", json={
        "username": "login_test",
        "password": "WrongPassword",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """POST /api/auth/login with nonexistent user should return 401."""
    resp = await client.post("/api/auth/login", json={
        "username": "ghost_user_12345",
        "password": "anything",
    })
    assert resp.status_code == 401


# ═══════════════════════════════════════════
# EVENT ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_get_events(client):
    """GET /api/events should return paginated response."""
    resp = await client.get("/api/events")
    assert resp.status_code == 200
    data = resp.json()
    assert "events" in data
    assert "total" in data
    assert "page" in data


@pytest.mark.asyncio
async def test_get_events_with_filters(client):
    """GET /api/events with severity filter should work."""
    resp = await client.get("/api/events?severity=Critical&page_size=10")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data["events"], list)


@pytest.mark.asyncio
async def test_get_event_stats(client):
    """GET /api/events/stats should return aggregate counts."""
    resp = await client.get("/api/events/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_events" in data
    assert "critical" in data


@pytest.mark.asyncio
async def test_get_event_by_id_not_found(client):
    """GET /api/events/99999 should return 404."""
    resp = await client.get("/api/events/99999")
    assert resp.status_code == 404


# ═══════════════════════════════════════════
# THREAT ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_threats_by_severity(client):
    """GET /api/threats/by-severity should return list."""
    resp = await client.get("/api/threats/by-severity")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_threats_by_type(client):
    """GET /api/threats/by-type should return list."""
    resp = await client.get("/api/threats/by-type")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_threats_top_ips(client):
    """GET /api/threats/top-ips should return list."""
    resp = await client.get("/api/threats/top-ips?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_threats_timeline(client):
    """GET /api/threats/timeline should return list."""
    resp = await client.get("/api/threats/timeline?days=7")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
