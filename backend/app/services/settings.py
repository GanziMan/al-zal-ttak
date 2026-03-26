"""사용자 설정 관리 (DB 기반, 유저별)"""
from __future__ import annotations

import time

from app.database import async_session
from app.models.settings import Settings

DEFAULT_SETTINGS = {
    "telegram_enabled": True,
    "telegram_chat_id": "",
    "min_importance_score": 30,
    "categories": ["호재", "악재", "중립", "단순정보"],
    "alert_categories": ["호재", "악재"],
    "disclosure_days": 7,
    "alert_keywords": [],
}

FIELDS = [
    "telegram_enabled", "telegram_chat_id", "min_importance_score",
    "categories", "alert_categories", "disclosure_days", "alert_keywords",
]

_SETTINGS_CACHE_TTL = 60
_settings_cache: dict[int, tuple[dict, float]] = {}


def _row_to_dict(row: Settings) -> dict:
    return {f: getattr(row, f) for f in FIELDS}


async def load_settings(user_id: int) -> dict:
    now = time.time()
    cached = _settings_cache.get(user_id)
    if cached and now - cached[1] < _SETTINGS_CACHE_TTL:
        return cached[0].copy()

    async with async_session() as session:
        row = await session.get(Settings, user_id)
        if not row:
            await save_settings(user_id, DEFAULT_SETTINGS)
            return DEFAULT_SETTINGS.copy()
        data = {**DEFAULT_SETTINGS, **_row_to_dict(row)}
        _settings_cache[user_id] = (data, now)
        return data.copy()


async def save_settings(user_id: int, data: dict):
    async with async_session() as session:
        row = await session.get(Settings, user_id)
        if not row:
            row = Settings(user_id=user_id)
            session.add(row)
        for f in FIELDS:
            if f in data:
                setattr(row, f, data[f])
        await session.commit()
        merged = {**DEFAULT_SETTINGS, **_row_to_dict(row)}
        _settings_cache[user_id] = (merged, time.time())
