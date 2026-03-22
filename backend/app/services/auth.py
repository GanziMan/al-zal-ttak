"""카카오 OAuth + JWT 인증 서비스"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
import httpx
from sqlalchemy import select

from app.config import settings
from app.database import async_session
from app.models.user import User

KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me"


def get_kakao_login_url() -> str:
    return (
        f"{KAKAO_AUTH_URL}"
        f"?client_id={settings.kakao_client_id}"
        f"&redirect_uri={settings.kakao_redirect_uri}"
        f"&response_type=code"
    )


async def exchange_kakao_code(code: str) -> dict:
    """인가 코드 → 카카오 access_token 교환"""
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.kakao_client_id,
        "redirect_uri": settings.kakao_redirect_uri,
        "code": code,
    }
    if settings.kakao_client_secret:
        data["client_secret"] = settings.kakao_client_secret

    async with httpx.AsyncClient() as client:
        resp = await client.post(KAKAO_TOKEN_URL, data=data)
        resp.raise_for_status()
        return resp.json()


async def get_kakao_user(access_token: str) -> dict:
    """카카오 사용자 정보 조회"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            KAKAO_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_or_create_user(kakao_id: str, nickname: str, profile_image: str) -> User:
    async with async_session() as session:
        result = await session.execute(select(User).where(User.kakao_id == kakao_id))
        user = result.scalar_one_or_none()
        if user:
            user.nickname = nickname
            user.profile_image = profile_image
            user.last_login = datetime.utcnow()
        else:
            user = User(
                kakao_id=kakao_id,
                nickname=nickname,
                profile_image=profile_image,
            )
            session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


def create_jwt(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
