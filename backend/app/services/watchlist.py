"""관심 종목 관리 (DB 기반)"""
from __future__ import annotations

from sqlalchemy import select, delete
from app.database import async_session
from app.models.watchlist import Watchlist


async def load_watchlist() -> list[dict]:
    async with async_session() as session:
        result = await session.execute(select(Watchlist))
        rows = result.scalars().all()
        return [{"corp_code": r.corp_code, "corp_name": r.corp_name, "stock_code": r.stock_code} for r in rows]


async def add_stock(corp_code: str, corp_name: str, stock_code: str) -> list[dict]:
    async with async_session() as session:
        existing = await session.get(Watchlist, corp_code)
        if existing:
            return await load_watchlist()
        session.add(Watchlist(corp_code=corp_code, corp_name=corp_name, stock_code=stock_code))
        await session.commit()
    return await load_watchlist()


async def remove_stock(corp_code: str) -> list[dict]:
    async with async_session() as session:
        await session.execute(delete(Watchlist).where(Watchlist.corp_code == corp_code))
        await session.commit()
    return await load_watchlist()
