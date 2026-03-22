"""기업 재무 데이터 API"""
from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Query, Depends

from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User
from app.services.dart_client import DartClient
from app.services.financial_data import get_all_company_data, get_financial_summary, get_dividend_history, get_shareholders

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{corp_code}/financials")
async def get_financials(
    corp_code: str,
    years: int = Query(5, ge=1, le=10),
    user: User = Depends(get_current_user),
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_financial_summary(dart_client, corp_code, years)
    return {"financials": data}


@router.get("/{corp_code}/dividends")
async def get_dividends(
    corp_code: str,
    years: int = Query(5, ge=1, le=10),
    user: User = Depends(get_current_user),
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_dividend_history(dart_client, corp_code, years)
    return {"dividends": data}


@router.get("/{corp_code}/shareholders")
async def get_shareholders_api(
    corp_code: str,
    user: User = Depends(get_current_user),
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_shareholders(dart_client, corp_code)
    return {"shareholders": data}


@router.get("/{corp_code}/summary")
async def get_company_summary(
    corp_code: str,
    user: User = Depends(get_current_user),
):
    dart_client = DartClient(api_key=settings.dart_api_key)

    async def _company():
        try:
            return await dart_client.get_company_info(corp_code)
        except Exception:
            return {}

    # 기업정보는 별도, 재무/배당/대주주는 batch로 효율적 조회
    company_info, (financials, dividends, shareholders) = await asyncio.gather(
        _company(),
        get_all_company_data(dart_client, corp_code, years=5),
    )

    return {
        "company": {
            "corp_name": company_info.get("corp_name", ""),
            "corp_name_eng": company_info.get("corp_name_eng", ""),
            "stock_code": company_info.get("stock_code", ""),
            "ceo_nm": company_info.get("ceo_nm", ""),
            "induty_code": company_info.get("induty_code", ""),
            "est_dt": company_info.get("est_dt", ""),
            "hm_url": company_info.get("hm_url", ""),
        },
        "financials": financials,
        "dividends": dividends,
        "shareholders": shareholders,
    }
