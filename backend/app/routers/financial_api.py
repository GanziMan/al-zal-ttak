"""기업 재무 데이터 API"""
from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, Query

from app.config import settings
from app.services.dart_client import DartClient
from app.services.financial_data import get_all_company_data, get_financial_summary, get_dividend_history, get_shareholders
from app.services.stock_price import get_stock_prices
from app.services.corp_code_loader import _corps_cache

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{corp_code}/financials")
async def get_financials(
    corp_code: str,
    years: int = Query(5, ge=1, le=10),
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_financial_summary(dart_client, corp_code, years)
    return {"financials": data}


@router.get("/{corp_code}/dividends")
async def get_dividends(
    corp_code: str,
    years: int = Query(5, ge=1, le=10),
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_dividend_history(dart_client, corp_code, years)
    return {"dividends": data}


@router.get("/{corp_code}/shareholders")
async def get_shareholders_api(
    corp_code: str,
):
    dart_client = DartClient(api_key=settings.dart_api_key)
    data = await get_shareholders(dart_client, corp_code)
    return {"shareholders": data}


@router.get("/{corp_code}/stock-price")
async def get_stock_price(
    corp_code: str,
    days: int = Query(30, ge=1, le=90),
):
    # corp_code → stock_code 변환
    stock_code = ""
    for c in _corps_cache:
        if c["corp_code"] == corp_code:
            stock_code = c["stock_code"]
            break
    if not stock_code:
        return {"prices": []}
    prices = await get_stock_prices(stock_code, corp_code, days=days)
    return {"prices": prices}


@router.get("/{corp_code}/summary")
async def get_company_summary(
    corp_code: str,
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
