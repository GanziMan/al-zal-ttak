"""설정 API"""
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models.user import User
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
async def get_settings(user: User = Depends(get_current_user)):
    return await load_settings(user.id)


@router.put("")
async def update_settings(req: UpdateSettingsRequest, user: User = Depends(get_current_user)):
    current = await load_settings(user.id)
    updates = req.model_dump(exclude_none=True)
    current.update(updates)
    await save_settings(user.id, current)
    return current
