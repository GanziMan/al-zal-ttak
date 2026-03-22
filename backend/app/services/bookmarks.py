"""북마크/메모 관리 (DB 기반, 유저별)"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, delete, and_
from app.database import async_session
from app.models.bookmark import Bookmark


async def load_bookmarks(user_id: int) -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            select(Bookmark).where(Bookmark.user_id == user_id).order_by(Bookmark.created_at.desc())
        )
        rows = result.scalars().all()
        return [
            {
                "rcept_no": r.rcept_no,
                "corp_name": r.corp_name,
                "report_nm": r.report_nm,
                "memo": r.memo,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]


async def add_bookmark(user_id: int, rcept_no: str, corp_name: str, report_nm: str, memo: str = "") -> list[dict]:
    async with async_session() as session:
        existing = await session.get(Bookmark, (user_id, rcept_no))
        if existing:
            return await load_bookmarks(user_id)
        session.add(Bookmark(
            user_id=user_id, rcept_no=rcept_no, corp_name=corp_name,
            report_nm=report_nm, memo=memo, created_at=datetime.utcnow(),
        ))
        await session.commit()
    return await load_bookmarks(user_id)


async def remove_bookmark(user_id: int, rcept_no: str) -> list[dict]:
    async with async_session() as session:
        await session.execute(
            delete(Bookmark).where(and_(Bookmark.user_id == user_id, Bookmark.rcept_no == rcept_no))
        )
        await session.commit()
    return await load_bookmarks(user_id)


async def update_memo(user_id: int, rcept_no: str, memo: str) -> list[dict]:
    async with async_session() as session:
        row = await session.get(Bookmark, (user_id, rcept_no))
        if row:
            row.memo = memo
            await session.commit()
    return await load_bookmarks(user_id)
