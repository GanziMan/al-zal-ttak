"""설정 API"""
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.settings import load_settings, save_settings

router = APIRouter()


class UpdateSettingsRequest(BaseModel):
    telegram_enabled: Optional[bool] = None
    telegram_chat_id: Optional[str] = None
    min_importance_score: Optional[int] = None
    alert_categories: Optional[List[str]] = None
    disclosure_days: Optional[int] = None
    alert_keywords: Optional[List[str]] = None


@router.get("")
async def get_settings():
    return load_settings()


@router.put("")
async def update_settings(req: UpdateSettingsRequest):
    current = load_settings()
    updates = req.model_dump(exclude_none=True)
    current.update(updates)
    save_settings(current)
    return current
