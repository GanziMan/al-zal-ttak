"""카카오 OAuth 인증 API"""
import logging
from urllib.parse import urlencode

from fastapi import APIRouter, Query, Depends
from fastapi.responses import RedirectResponse

from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User
from app.services.auth import (
    get_kakao_login_url,
    exchange_kakao_code,
    get_kakao_user,
    get_or_create_user,
    create_jwt,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/kakao/login")
async def kakao_login():
    return RedirectResponse(url=get_kakao_login_url())


@router.get("/kakao/callback")
async def kakao_callback(code: str = Query(...)):
    try:
        token_data = await exchange_kakao_code(code)
        access_token = token_data["access_token"]

        kakao_user = await get_kakao_user(access_token)
        kakao_id = str(kakao_user["id"])
        profile = kakao_user.get("kakao_account", {}).get("profile", {})
        nickname = profile.get("nickname", "")
        profile_image = profile.get("profile_image_url", "")

        user = await get_or_create_user(kakao_id, nickname, profile_image)
        jwt_token = create_jwt(user.id)

        redirect_url = f"{settings.frontend_url}/auth/callback?{urlencode({'token': jwt_token})}"
        return RedirectResponse(url=redirect_url)
    except Exception:
        logger.exception("Kakao OAuth failed")
        redirect_url = f"{settings.frontend_url}/login?error=auth_failed"
        return RedirectResponse(url=redirect_url)


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "nickname": user.nickname,
        "profile_image": user.profile_image,
    }
