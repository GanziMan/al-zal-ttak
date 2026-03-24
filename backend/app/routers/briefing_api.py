"""오늘의 AI 브리핑 API"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.briefing import generate_daily_briefing
from app.services.auth import decode_jwt

router = APIRouter()

_bearer = HTTPBearer(auto_error=False)


@router.get("/daily")
async def daily_briefing(
    cred: HTTPAuthorizationCredentials | None = Depends(_bearer),
):
    """선택적 인증: 토큰 있으면 관심종목 필터, 없으면 전체"""
    user_id = None
    if cred:
        try:
            payload = decode_jwt(cred.credentials)
            user_id = int(payload["sub"])
        except Exception:
            pass
    briefing = await generate_daily_briefing(user_id=user_id)
    return briefing
