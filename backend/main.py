"""
Chef-Mistral Backend — FastAPI Application
Provides authentication (email/password + Google OAuth) and AI recipe generation.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from database import get_db, init_db, close_db
from models import User
from auth import (
    hash_password,
    verify_password,
    validate_password,
    create_access_token,
    get_current_user,
)
from oauth import get_google_auth_url, get_google_user_info
from ai import get_recipe

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ─── Lifespan ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup, dispose engine on shutdown."""
    await init_db()
    yield
    await close_db()


# ─── App ─────────────────────────────────────────────────────────
app = FastAPI(
    title="Chef Mistral API",
    description="AI-powered recipe generation with authentication",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic schemas ───────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class RecipeRequest(BaseModel):
    ingredients: list[str]


class RecipeResponse(BaseModel):
    recipe: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_google_user: bool
    avatar_url: str | None
    created_at: str


# ─── Health check ────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "chef-mistral-api"}


# ─── Auth: Register ─────────────────────────────────────────────
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new user with email and password."""
    # Validate password strength
    password_errors = validate_password(request.password)
    if password_errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"password_errors": password_errors},
        )

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user
    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hash_password(request.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate JWT
    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_google_user": user.is_google_user,
            "avatar_url": user.avatar_url,
        },
    )


# ─── Auth: Login ─────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Log in with email and password."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_google_user": user.is_google_user,
            "avatar_url": user.avatar_url,
        },
    )


# ─── Auth: Google OAuth ─────────────────────────────────────────
@app.get("/api/auth/google")
async def google_login():
    """Redirect to Google's OAuth consent screen."""
    auth_url = get_google_auth_url()
    return RedirectResponse(url=auth_url)


@app.get("/api/auth/google/callback")
async def google_callback(
    code: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Handle the OAuth callback from Google.
    Creates a new user if it's their first login, otherwise finds existing.
    Redirects to the frontend with a JWT token in the URL.
    """
    try:
        google_user = await get_google_user_info(code)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with Google",
        )

    # Check if user exists by Google ID
    result = await db.execute(
        select(User).where(User.google_id == google_user["google_id"])
    )
    user = result.scalar_one_or_none()

    if not user:
        # Check if email already exists (e.g., registered with password)
        result = await db.execute(
            select(User).where(User.email == google_user["email"])
        )
        user = result.scalar_one_or_none()

        if user:
            # Link Google account to existing email user
            user.google_id = google_user["google_id"]
            user.is_google_user = True
            user.avatar_url = google_user.get("picture")
            await db.commit()
            await db.refresh(user)
        else:
            # Create new user from Google profile
            user = User(
                username=google_user["name"],
                email=google_user["email"],
                google_id=google_user["google_id"],
                is_google_user=True,
                avatar_url=google_user.get("picture"),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

    token = create_access_token(data={"sub": user.id})

    # Redirect to frontend with token as query parameter
    return RedirectResponse(
        url=f"{FRONTEND_URL}/login?token={token}&google=true"
    )


# ─── Auth: Get current user ─────────────────────────────────────
@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return the currently authenticated user's profile."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_google_user=current_user.is_google_user,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at.isoformat(),
    )


# ─── Recipe generation ──────────────────────────────────────────
@app.post("/api/recipe/generate", response_model=RecipeResponse)
async def generate_recipe(
    request: RecipeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Generate a recipe from the given ingredients. Requires authentication."""
    if len(request.ingredients) < 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide at least 4 ingredients",
        )

    # Filter out empty strings
    ingredients = [i.strip() for i in request.ingredients if i.strip()]
    if len(ingredients) < 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide at least 4 valid ingredients",
        )

    try:
        recipe = await get_recipe(ingredients)
        return RecipeResponse(recipe=recipe)
    except Exception as e:
        logging.error(f"Recipe generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recipe generation failed: {str(e)}",
        )
