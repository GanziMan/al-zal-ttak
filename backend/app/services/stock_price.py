"""주가 데이터 (네이버 금융 크롤링 + DB 캐시)"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select

from app.database import async_session
from app.models.financial_data import FinancialData

logger = logging.getLogger(__name__)

CACHE_TTL_HOURS = 6

# 네이버 크롤링 동시 요청 제한
_naver_semaphore = asyncio.Semaphore(3)


async def _fetch_naver_prices(stock_code: str, pages: int = 3) -> list[dict]:
    """네이버 금융 일별 시세 크롤링"""
    url = "https://finance.naver.com/item/sise_day.naver"
    headers = {"User-Agent": "Mozilla/5.0"}
    results = []

    async with _naver_semaphore:
        async with httpx.AsyncClient(headers=headers) as client:
            for page in range(1, pages + 1):
                try:
                    resp = await client.get(url, params={"code": stock_code, "page": page}, timeout=10)
                    soup = BeautifulSoup(resp.text, "html.parser")
                    rows = soup.select("table.type2 tr")

                    for row in rows:
                        cols = row.select("td span.tah")
                        if len(cols) < 7:
                            continue
                        date_el = row.select_one("td span.tah")
                        if not date_el:
                            continue
                        date_text = date_el.text.strip()
                        if not date_text or "." not in date_text:
                            continue

                        try:
                            close = int(cols[1].text.strip().replace(",", ""))
                            change_text = cols[2].text.strip().replace(",", "")
                            change = int(change_text) if change_text else 0
                            open_p = int(cols[3].text.strip().replace(",", ""))
                            high = int(cols[4].text.strip().replace(",", ""))
                            low = int(cols[5].text.strip().replace(",", ""))
                            volume = int(cols[6].text.strip().replace(",", ""))
                        except (ValueError, IndexError):
                            continue

                        # 상승/하락 판단
                        img = row.select_one("td img")
                        if img and "ico_down" in img.get("src", ""):
                            change = -abs(change)

                        results.append({
                            "date": date_text.replace(".", "-"),
                            "close": close,
                            "open": open_p,
                            "high": high,
                            "low": low,
                            "volume": volume,
                            "change": change,
                        })
                except Exception:
                    logger.warning("Failed to fetch page %d for %s", page, stock_code)

    if not results:
        logger.warning("No price data fetched for %s", stock_code)

    return results


async def get_stock_prices(stock_code: str, corp_code: str, days: int = 30) -> list[dict]:
    """주가 데이터 조회 (캐시 우선, 미스 시 크롤링)"""
    cache_key_type = "stock_price"
    now = datetime.now()

    # 캐시 확인
    async with async_session() as session:
        query = select(FinancialData).where(
            FinancialData.corp_code == corp_code,
            FinancialData.data_type == cache_key_type,
            FinancialData.bsns_year == "latest",
            FinancialData.reprt_code == "daily",
        )
        result = await session.execute(query)
        cached = result.scalar_one_or_none()

    if cached:
        try:
            fetched_at = datetime.fromisoformat(cached.fetched_at)
        except (ValueError, TypeError):
            fetched_at = datetime.min
        if (now - fetched_at).total_seconds() < CACHE_TTL_HOURS * 3600:
            prices = (cached.data or {}).get("prices", [])
            return prices[:days]

    # 크롤링
    pages = max(2, days // 10)
    prices = await _fetch_naver_prices(stock_code, pages=pages)

    if prices:
        # DB 캐시 저장
        async with async_session() as session:
            row = await session.get(
                FinancialData,
                (corp_code, cache_key_type, "latest", "daily"),
            )
            if not row:
                row = FinancialData(
                    corp_code=corp_code,
                    data_type=cache_key_type,
                    bsns_year="latest",
                    reprt_code="daily",
                )
                session.add(row)
            row.data = {"prices": prices}
            row.fetched_at = now.isoformat()
            await session.commit()

    return prices[:days]


async def calculate_price_impact(
    stock_code: str, corp_code: str, disclosure_date: str
) -> dict | None:
    """공시일 전후 주가 변동 계산"""
    prices = await get_stock_prices(stock_code, corp_code, days=60)
    if not prices:
        return None

    # 날짜 정규화 (YYYYMMDD → YYYY-MM-DD)
    if len(disclosure_date) == 8 and "-" not in disclosure_date:
        d_date = f"{disclosure_date[:4]}-{disclosure_date[4:6]}-{disclosure_date[6:8]}"
    else:
        d_date = disclosure_date

    # 날짜별 가격 맵
    price_map: dict[str, dict] = {}
    sorted_dates: list[str] = []
    for p in prices:
        price_map[p["date"]] = p
        sorted_dates.append(p["date"])

    sorted_dates.sort()

    # 공시일 이전 가장 가까운 거래일 찾기
    before_dates = [d for d in sorted_dates if d < d_date]
    after_dates = [d for d in sorted_dates if d >= d_date]

    if not before_dates or not after_dates:
        return None

    before_price = price_map[before_dates[-1]]["close"]

    # 1일/3일/5일 후 가격
    change_1d = None
    change_3d = None
    change_5d = None

    if len(after_dates) >= 1:
        p1 = price_map[after_dates[0]]["close"]
        change_1d = round((p1 - before_price) / before_price * 100, 2)
    if len(after_dates) >= 3:
        p3 = price_map[after_dates[2]]["close"]
        change_3d = round((p3 - before_price) / before_price * 100, 2)
    if len(after_dates) >= 5:
        p5 = price_map[after_dates[4]]["close"]
        change_5d = round((p5 - before_price) / before_price * 100, 2)

    after_price = price_map[after_dates[0]]["close"] if after_dates else before_price

    return {
        "before_price": before_price,
        "after_price": after_price,
        "change_1d": change_1d,
        "change_3d": change_3d,
        "change_5d": change_5d,
        "prices": prices[:10],
    }
