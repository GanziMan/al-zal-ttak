"""관심 종목 관리 (DB 기반, 유저별)"""
from __future__ import annotations

from sqlalchemy import select, delete, and_
from app.database import async_session
from app.models.watchlist import Watchlist


async def load_watchlist(user_id: int) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            select(Watchlist).where(Watchlist.user_id == user_id)
        )
        rows = result.scalars().all()
        return [{"corp_code": r.corp_code, "corp_name": r.corp_name, "stock_code": r.stock_code} for r in rows]


async def add_stock(user_id: int, corp_code: str, corp_name: str, stock_code: str) -> list[dict]:
    async with async_session() as session:
        existing = await session.get(Watchlist, (user_id, corp_code))
        if existing:
            return await load_watchlist(user_id)
        session.add(Watchlist(user_id=user_id, corp_code=corp_code, corp_name=corp_name, stock_code=stock_code))
        await session.commit()
    return await load_watchlist(user_id)


async def remove_stock(user_id: int, corp_code: str) -> list[dict]:
    async with async_session() as session:
        await session.execute(
            delete(Watchlist).where(and_(Watchlist.user_id == user_id, Watchlist.corp_code == corp_code))
        )
        await session.commit()
    return await load_watchlist(user_id)
