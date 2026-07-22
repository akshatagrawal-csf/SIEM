"""
SIEM Analytics System - Authentication Routes

Endpoints:
  POST /api/auth/register  → Create a new user account
  POST /api/auth/login     → Authenticate and receive JWT token
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new analyst/admin/manager account with bcrypt-hashed password.",
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username already taken
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{user_data.username}' is already registered",
        )

    # Validate role
    allowed_roles = {"analyst", "admin", "manager"}
    role = user_data.role.lower()
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{user_data.role}'. Must be one of: {', '.join(allowed_roles)}",
        )

    # Create user with hashed password
    new_user = User(
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        role=role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT token",
    description="Authenticates credentials and returns a Bearer JWT token valid for JWT_EXPIRY_MINUTES.",
)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(
        select(User).where(User.username == credentials.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token
    token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        role=user.role,
    )
