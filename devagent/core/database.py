"""
Database configuration and session management.
"""

import os
from typing import AsyncGenerator

# Removed global engine and session factory to ensure settings are always from get_settings()
# from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
# from sqlalchemy.ext.declarative import declarative_base # Redundant import
from sqlalchemy.orm import declarative_base, sessionmaker

import asyncio
import logging

from devagent.core.config import get_settings # Added import for get_settings

# Configure a logger for this module
logger = logging.getLogger(__name__)

# Removed global DATABASE_URL, ASYNC_DATABASE_URL, engine, async_session_factory
# These will now be created dynamically within functions using get_settings()

# Create base class for models
Base = declarative_base()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions.
    """
    settings = get_settings()
    # Construct async URL from settings
    async_db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(async_db_url, echo=False) # Using async_db_url
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Removed await session.commit() - commit should be explicit in routes/services
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize the database, creating all tables.
    """
    settings = get_settings()
    # Construct async URL from settings
    async_db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(async_db_url, echo=False) # Using async_db_url

    max_retries = 5
    retry_delay = 5  # seconds

    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created/verified successfully.")
            return  # Success, exit the function
        except Exception as e:
            logger.error(f"Database connection attempt {attempt + 1} of {max_retries} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("Max retries reached. Database initialization failed.")
                # Consider not re-raising here to allow app to start,
                # but log verbosely. Or re-raise if DB is critical for ANY operation.
                raise # Re-raise the last exception if all retries fail

    # This part should not be reached if successful or if an exception is re-raised
    # Ensure all tables are created
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
