"""북마크/메모 관리 (DB 기반)"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, delete
from app.database import async_session
from app.models.bookmark import Bookmark


async def load_bookmarks() -> list[dict]:
    async with async_session() as session:
        result = await session.execute(select(Bookmark).order_by(Bookmark.created_at.desc()))
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


async def add_bookmark(rcept_no: str, corp_name: str, report_nm: str, memo: str = "") -> list[dict]:
    async with async_session() as session:
        existing = await session.get(Bookmark, rcept_no)
        if existing:
            return await load_bookmarks()
        session.add(Bookmark(
            rcept_no=rcept_no, corp_name=corp_name, report_nm=report_nm,
            memo=memo, created_at=datetime.utcnow(),
        ))
        await session.commit()
    return await load_bookmarks()


async def remove_bookmark(rcept_no: str) -> list[dict]:
    async with async_session() as session:
        await session.execute(delete(Bookmark).where(Bookmark.rcept_no == rcept_no))
        await session.commit()
    return await load_bookmarks()


async def update_memo(rcept_no: str, memo: str) -> list[dict]:
    async with async_session() as session:
        row = await session.get(Bookmark, rcept_no)
        if row:
            row.memo = memo
            await session.commit()
    return await load_bookmarks()
