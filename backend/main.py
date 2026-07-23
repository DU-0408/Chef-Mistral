"""
Chef-Qwen Backend — FastAPI Application
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
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from database import get_db, init_db, close_db
from models import User, Recipe, PantryItem
from auth import (
    hash_password,
    verify_password,
    validate_password,
    create_access_token,
    get_current_user,
)
from oauth import get_google_auth_url, get_google_user_info
from ai import get_recipe, generate_recipe_image

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
    title="Chef Qwen API",
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
    dietary_restrictions: str | None = None
    created_at: str

class ProfileUpdateRequest(BaseModel):
    dietary_restrictions: str | None

class RecipeCreateRequest(BaseModel):
    title: str
    content: str
    image_url: str | None = None

class RecipeSchema(BaseModel):
    id: str
    title: str
    content: str
    image_url: str | None
    is_favorite: bool
    created_at: str

class PantryItemCreateRequest(BaseModel):
    name: str

class PantryItemSchema(BaseModel):
    id: str
    name: str
    created_at: str

class ImageGenerateRequest(BaseModel):
    prompt: str

class ImageGenerateResponse(BaseModel):
    image_b64: str


# ─── Health check ────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "chef-qwen-api"}


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
        dietary_restrictions=current_user.dietary_restrictions,
        created_at=current_user.created_at.isoformat(),
    )

@app.patch("/api/auth/me", response_model=UserResponse)
async def update_me(
    request: ProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update user profile (dietary restrictions)."""
    current_user.dietary_restrictions = request.dietary_restrictions
    await db.commit()
    await db.refresh(current_user)
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_google_user=current_user.is_google_user,
        avatar_url=current_user.avatar_url,
        dietary_restrictions=current_user.dietary_restrictions,
        created_at=current_user.created_at.isoformat(),
    )


# ─── Recipe generation ──────────────────────────────────────────
@app.post("/api/recipe/generate", response_model=RecipeResponse)
async def generate_recipe_endpoint(
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
        recipe = await get_recipe(ingredients, current_user.dietary_restrictions)
        return RecipeResponse(recipe=recipe)
    except Exception as e:
        logging.error(f"Recipe generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recipe generation failed: {str(e)}",
        )

@app.post("/api/recipe/image", response_model=ImageGenerateResponse)
async def generate_image_endpoint(
    request: ImageGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Generate an image for a recipe."""
    try:
        image_b64 = await generate_recipe_image(request.prompt)
        return ImageGenerateResponse(image_b64=image_b64)
    except Exception as e:
        logging.error(f"Image generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Failed to generate image. Please try again later."
        )

# ─── Recipes CRUD ───────────────────────────────────────────────
@app.get("/api/recipes", response_model=list[RecipeSchema])
async def get_recipes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Recipe).where(Recipe.user_id == current_user.id).order_by(Recipe.created_at.desc()))
    return [
        RecipeSchema(
            id=r.id, title=r.title, content=r.content, image_url=r.image_url,
            is_favorite=r.is_favorite, created_at=r.created_at.isoformat()
        ) for r in result.scalars().all()
    ]

@app.post("/api/recipes", response_model=RecipeSchema)
async def create_recipe(
    request: RecipeCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    recipe = Recipe(
        user_id=current_user.id,
        title=request.title,
        content=request.content,
        image_url=request.image_url,
    )
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    return RecipeSchema(
        id=recipe.id, title=recipe.title, content=recipe.content,
        image_url=recipe.image_url, is_favorite=recipe.is_favorite, created_at=recipe.created_at.isoformat()
    )

@app.patch("/api/recipes/{recipe_id}")
async def patch_recipe(
    recipe_id: str,
    is_favorite: bool,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == current_user.id))
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    recipe.is_favorite = is_favorite
    await db.commit()
    return {"status": "updated"}

@app.delete("/api/recipes/{recipe_id}")
async def delete_recipe(
    recipe_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await db.execute(delete(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == current_user.id))
    await db.commit()
    return {"status": "deleted"}

# ─── Pantry CRUD ───────────────────────────────────────────────
@app.get("/api/pantry", response_model=list[PantryItemSchema])
async def get_pantry(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(PantryItem).where(PantryItem.user_id == current_user.id).order_by(PantryItem.created_at.desc()))
    return [
        PantryItemSchema(id=p.id, name=p.name, created_at=p.created_at.isoformat())
        for p in result.scalars().all()
    ]

@app.post("/api/pantry", response_model=PantryItemSchema)
async def add_pantry_item(
    request: PantryItemCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    item = PantryItem(user_id=current_user.id, name=request.name)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return PantryItemSchema(id=item.id, name=item.name, created_at=item.created_at.isoformat())

@app.delete("/api/pantry/{item_id}")
async def delete_pantry_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await db.execute(delete(PantryItem).where(PantryItem.id == item_id, PantryItem.user_id == current_user.id))
    await db.commit()
    return {"status": "deleted"}
