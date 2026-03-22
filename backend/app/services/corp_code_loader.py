"""DART 기업코드 목록 다운로드 및 검색 (DB 기반)"""
from __future__ import annotations

import io
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict

import httpx
from sqlalchemy import select, func

from app.database import async_session
from app.models.corp_code import CorpCode

DART_BASE_URL = "https://opendart.fss.or.kr/api"


async def download_corp_codes(api_key: str) -> List[Dict]:
    """DART에서 기업코드 목록 다운로드 → DB 저장"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DART_BASE_URL}/corpCode.xml",
            params={"crtfc_key": api_key},
            timeout=60,
        )

    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    xml_name = zf.namelist()[0]
    xml_content = zf.read(xml_name).decode("utf-8")

    root = ET.fromstring(xml_content)
    corps = []
    for item in root.findall("list"):
        corp_code = item.findtext("corp_code", "")
        corp_name = item.findtext("corp_name", "")
        stock_code = item.findtext("stock_code", "").strip()
        if stock_code:
            corps.append({
                "corp_code": corp_code,
                "corp_name": corp_name,
                "stock_code": stock_code,
            })

    # DB에 upsert
    async with async_session() as session:
        for c in corps:
            existing = await session.get(CorpCode, c["corp_code"])
            if existing:
                existing.corp_name = c["corp_name"]
                existing.stock_code = c["stock_code"]
            else:
                session.add(CorpCode(**c))
        await session.commit()

    return corps


async def load_cached_corps() -> List[Dict]:
    """DB에서 기업코드 목록 로드"""
    async with async_session() as session:
        result = await session.execute(select(CorpCode))
        rows = result.scalars().all()
        return [{"corp_code": r.corp_code, "corp_name": r.corp_name, "stock_code": r.stock_code} for r in rows]


async def search_corps(keyword: str) -> List[Dict]:
    """기업명으로 검색 (DB)"""
    async with async_session() as session:
        result = await session.execute(
            select(CorpCode).where(CorpCode.corp_name.ilike(f"%{keyword}%")).limit(20)
        )
        rows = result.scalars().all()
        return [{"corp_code": r.corp_code, "corp_name": r.corp_name, "stock_code": r.stock_code} for r in rows]
