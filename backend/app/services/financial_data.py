"""재무제표, 배당, 대주주 데이터 서비스 (DART API + DB 캐시)"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy import select

from app.database import async_session
from app.models.financial_data import FinancialData
from app.services.dart_client import DartClient

logger = logging.getLogger(__name__)

CACHE_TTL_HOURS = 24


def _is_cache_fresh(fetched_at: str) -> bool:
    try:
        dt = datetime.fromisoformat(fetched_at)
        return datetime.now() - dt < timedelta(hours=CACHE_TTL_HOURS)
    except Exception:
        return False


async def _batch_get_cached(corp_code: str) -> dict[tuple[str, str, str], dict]:
    """corp_code의 모든 캐시 데이터를 한 번에 로드 → {(data_type, year, reprt_code): data}"""
    async with async_session() as session:
        stmt = select(FinancialData).where(FinancialData.corp_code == corp_code)
        result = await session.execute(stmt)
        rows = result.scalars().all()

    cache = {}
    for row in rows:
        if _is_cache_fresh(row.fetched_at):
            cache[(row.data_type, row.bsns_year, row.reprt_code)] = row.data
    return cache


async def _save_cache(corp_code: str, data_type: str, bsns_year: str, reprt_code: str, data: dict) -> None:
    async with async_session() as session:
        existing = await session.get(FinancialData, (corp_code, data_type, bsns_year, reprt_code))
        if existing:
            existing.data = data
            existing.fetched_at = datetime.now().isoformat()
        else:
            session.add(FinancialData(
                corp_code=corp_code,
                data_type=data_type,
                bsns_year=bsns_year,
                reprt_code=reprt_code,
                data=data,
                fetched_at=datetime.now().isoformat(),
            ))
        await session.commit()


async def _batch_save_cache(items: list[tuple[str, str, str, str, dict]]) -> None:
    """여러 캐시를 한 트랜잭션에 저장: [(corp_code, data_type, year, reprt_code, data), ...]"""
    if not items:
        return
    async with async_session() as session:
        for corp_code, data_type, bsns_year, reprt_code, data in items:
            existing = await session.get(FinancialData, (corp_code, data_type, bsns_year, reprt_code))
            if existing:
                existing.data = data
                existing.fetched_at = datetime.now().isoformat()
            else:
                session.add(FinancialData(
                    corp_code=corp_code,
                    data_type=data_type,
                    bsns_year=bsns_year,
                    reprt_code=reprt_code,
                    data=data,
                    fetched_at=datetime.now().isoformat(),
                ))
        await session.commit()


def _parse_financial_statements(raw: dict) -> list[dict]:
    """DART 재무제표 응답에서 주요 계정 추출 (연결재무제표 우선)"""
    if raw.get("status") != "000":
        return []

    items = raw.get("list", [])
    cfs = [i for i in items if i.get("fs_div") == "CFS"]
    rows = cfs if cfs else [i for i in items if i.get("fs_div") == "OFS"]

    result = []
    for row in rows:
        account = row.get("account_nm", "")
        if account in ("매출액", "영업이익", "당기순이익", "자산총계", "부채총계", "자본총계"):
            val = row.get("thstrm_amount", "")
            result.append({
                "account": account,
                "amount": _parse_amount(val),
                "amount_raw": val,
            })
    return result


def _parse_dividends(raw: dict) -> list[dict]:
    """DART 배당 응답 파싱"""
    if raw.get("status") != "000":
        return []
    return raw.get("list", [])


def _parse_shareholders(raw: dict) -> list[dict]:
    """DART 대주주 응답 파싱"""
    if raw.get("status") != "000":
        return []
    items = raw.get("list", [])
    result = []
    for item in items:
        result.append({
            "name": item.get("nm", ""),
            "relation": item.get("relate", ""),
            "shares": _parse_amount(item.get("stock_knd", "") + " " + item.get("bsis_posesn_stock_co", "")),
            "shares_raw": item.get("bsis_posesn_stock_co", ""),
            "ownership_pct": item.get("bsis_posesn_stock_qota_rt", ""),
        })
    return result


def _parse_amount(val: str) -> int:
    """문자열 금액 → 정수 (쉼표, 공백 제거)"""
    if not val:
        return 0
    try:
        return int(val.replace(",", "").replace(" ", "").replace("-", "0"))
    except (ValueError, TypeError):
        return 0


async def get_all_company_data(
    dart_client: DartClient, corp_code: str, years: int = 5,
) -> tuple[list[dict], list[dict], list[dict]]:
    """재무 + 배당 + 대주주를 한 번에 효율적으로 조회.

    1) DB에서 corp_code의 모든 캐시를 1번의 쿼리로 로드
    2) 캐시 미스인 항목만 DART API 병렬 호출
    3) 새로 가져온 데이터를 1번의 트랜잭션으로 일괄 저장
    """
    current_year = datetime.now().year
    year_list = [str(y) for y in range(current_year - years, current_year)]

    # 1) 캐시 일괄 로드 (DB 쿼리 1번)
    cache = await _batch_get_cached(corp_code)

    # 2) 캐시 히트/미스 분류
    financials_result: dict[str, list[dict]] = {}
    dividends_result: dict[str, list[dict]] = {}
    shareholders_result: list[dict] | None = None

    dart_tasks: list[tuple[str, str, str, asyncio.Task]] = []  # (type, year, reprt_code, task)

    for y in year_list:
        # 재무
        cached_fin = cache.get(("financial", y, "11011"))
        if cached_fin is not None:
            financials_result[y] = cached_fin
        else:
            task = asyncio.create_task(_fetch_dart(dart_client, "financial", corp_code, y))
            dart_tasks.append(("financial", y, "11011", task))

        # 배당
        cached_div = cache.get(("dividend", y, "11011"))
        if cached_div is not None:
            dividends_result[y] = cached_div
        else:
            task = asyncio.create_task(_fetch_dart(dart_client, "dividend", corp_code, y))
            dart_tasks.append(("dividend", y, "11011", task))

    # 대주주: 최신 연도 캐시 확인
    sh_tasks: list[tuple[str, asyncio.Task]] = []
    for y in range(current_year, current_year - 3, -1):
        cached_sh = cache.get(("shareholder", str(y), "11011"))
        if cached_sh is not None:
            shareholders_result = cached_sh
            break

    if shareholders_result is None:
        # 캐시 없으면 최근 3년 병렬 조회
        for y in range(current_year, current_year - 3, -1):
            task = asyncio.create_task(_fetch_dart(dart_client, "shareholder", corp_code, str(y)))
            sh_tasks.append((str(y), task))

    # 3) DART API 병렬 대기
    save_items: list[tuple[str, str, str, str, dict]] = []

    if dart_tasks:
        await asyncio.gather(*[t[3] for t in dart_tasks], return_exceptions=True)
        for data_type, year, reprt_code, task in dart_tasks:
            try:
                parsed = task.result()
            except Exception:
                logger.warning("Failed to fetch %s for %s/%s", data_type, corp_code, year)
                parsed = []

            if data_type == "financial":
                financials_result[year] = parsed
            else:
                dividends_result[year] = parsed

            save_items.append((corp_code, data_type, year, reprt_code, parsed))

    # 대주주 결과 처리
    if shareholders_result is None:
        for y_str, task in sh_tasks:
            try:
                await task
                parsed = task.result()
            except Exception:
                logger.warning("Failed to fetch shareholders for %s/%s", corp_code, y_str)
                parsed = []

            if parsed:
                shareholders_result = parsed
                save_items.append((corp_code, "shareholder", y_str, "11011", parsed))
                # 나머지 태스크 취소
                for _, remaining_task in sh_tasks:
                    if remaining_task is not task and not remaining_task.done():
                        remaining_task.cancel()
                break

        if shareholders_result is None:
            shareholders_result = []

    # 4) 새 데이터 일괄 저장 (DB 트랜잭션 1번)
    if save_items:
        try:
            await _batch_save_cache(save_items)
        except Exception:
            logger.warning("Failed to batch save cache for %s", corp_code)

    # 결과 조립
    financials = [{"year": y, "accounts": financials_result.get(y, [])} for y in year_list]
    dividends = [{"year": y, "dividends": dividends_result.get(y, [])} for y in year_list]

    return financials, dividends, shareholders_result


async def _fetch_dart(dart_client: DartClient, data_type: str, corp_code: str, bsns_year: str) -> list[dict]:
    """DART API 호출 + 파싱"""
    if data_type == "financial":
        raw = await dart_client.get_financial_statements(corp_code, bsns_year)
        return _parse_financial_statements(raw)
    elif data_type == "dividend":
        raw = await dart_client.get_dividends(corp_code, bsns_year)
        return _parse_dividends(raw)
    elif data_type == "shareholder":
        raw = await dart_client.get_major_shareholders(corp_code, bsns_year)
        return _parse_shareholders(raw)
    return []


# --- 개별 API용 (하위호환) ---

async def get_financial_summary(dart_client: DartClient, corp_code: str, years: int = 5) -> list[dict]:
    current_year = datetime.now().year
    year_list = [str(y) for y in range(current_year - years, current_year)]

    async def _fetch_one(bsns_year: str) -> dict:
        cache = await _batch_get_cached(corp_code)
        cached = cache.get(("financial", bsns_year, "11011"))
        if cached is not None:
            return {"year": bsns_year, "accounts": cached}
        try:
            parsed = await _fetch_dart(dart_client, "financial", corp_code, bsns_year)
            await _save_cache(corp_code, "financial", bsns_year, "11011", parsed)
            return {"year": bsns_year, "accounts": parsed}
        except Exception:
            logger.warning("Failed to fetch financials for %s/%s", corp_code, bsns_year)
            return {"year": bsns_year, "accounts": []}

    return await asyncio.gather(*[_fetch_one(y) for y in year_list])


async def get_dividend_history(dart_client: DartClient, corp_code: str, years: int = 5) -> list[dict]:
    current_year = datetime.now().year
    year_list = [str(y) for y in range(current_year - years, current_year)]

    async def _fetch_one(bsns_year: str) -> dict:
        cache = await _batch_get_cached(corp_code)
        cached = cache.get(("dividend", bsns_year, "11011"))
        if cached is not None:
            return {"year": bsns_year, "dividends": cached}
        try:
            parsed = await _fetch_dart(dart_client, "dividend", corp_code, bsns_year)
            await _save_cache(corp_code, "dividend", bsns_year, "11011", parsed)
            return {"year": bsns_year, "dividends": parsed}
        except Exception:
            logger.warning("Failed to fetch dividends for %s/%s", corp_code, bsns_year)
            return {"year": bsns_year, "dividends": []}

    return await asyncio.gather(*[_fetch_one(y) for y in year_list])


async def get_shareholders(dart_client: DartClient, corp_code: str) -> list[dict]:
    current_year = datetime.now().year

    for year in range(current_year, current_year - 3, -1):
        bsns_year = str(year)
        cache = await _batch_get_cached(corp_code)
        cached = cache.get(("shareholder", bsns_year, "11011"))
        if cached is not None:
            return cached
        try:
            parsed = await _fetch_dart(dart_client, "shareholder", corp_code, bsns_year)
            if parsed:
                await _save_cache(corp_code, "shareholder", bsns_year, "11011", parsed)
                return parsed
        except Exception:
            logger.warning("Failed to fetch shareholders for %s/%s", corp_code, bsns_year)

    return []
