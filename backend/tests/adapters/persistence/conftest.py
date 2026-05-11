from __future__ import annotations

from collections.abc import AsyncIterator

import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from tests.conftest import truncate_all


@pytest_asyncio.fixture
async def session(
    engine: AsyncEngine,
    sessions: async_sessionmaker[AsyncSession],
) -> AsyncIterator[AsyncSession]:
    async with sessions() as s:
        try:
            yield s
            await s.rollback()
        finally:
            await truncate_all(engine)
