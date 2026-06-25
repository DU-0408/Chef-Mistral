"""
Async SQLAlchemy database configuration for PostgreSQL.
Uses asyncpg driver for fully async database operations.
"""

import os
import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/chef_qwen")

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=False,)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


async def get_db():
    """
    FastAPI dependency that yields an async database session.
    Ensures the session is properly closed after each request.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all database tables on startup with retry logic."""
    retries = 5
    for attempt in range(retries):
        try:
            async with engine.begin() as conn:
                from models import User  # noqa: F401 — import to register model
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables verified/created successfully.")
            break
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt + 1}/{retries} failed: {e}")
            if attempt == retries - 1:
                logger.error("Exhausted all retries connecting to the database.")
                raise e
            await asyncio.sleep(2)


async def close_db():
    """Dispose of the engine connection pool on shutdown."""
    await engine.dispose()
