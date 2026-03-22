"""대시보드 집계 API"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Query

from app.config import settings
from app.services.dart_client import DartClient
from app.services.disclosure_filter import get_watchlist_disclosures
from app.services.watchlist import load_watchlist
from app.services.analysis_cache import get_cached_analysis, list_all_cached_full

router = APIRouter()


@router.get("/summary")
async def get_summary():
    watchlist = load_watchlist()
    dart_client = DartClient(api_key=settings.dart_api_key)

    disclosures = await get_watchlist_disclosures(dart_client, days=1) if watchlist else []

    bullish = 0
    bearish = 0
    important = []

    for d in disclosures:
        rcept_no = d.get("rcept_no", "")
        cached = get_cached_analysis(rcept_no) if rcept_no else None
        if cached:
            d["analysis"] = cached
            cat = cached.get("category", "")
            score = cached.get("importance_score", 0)
            if cat == "호재":
                bullish += 1
            elif cat == "악재":
                bearish += 1
            if score >= 50:
                important.append(d)

    return {
        "watchlist_count": len(watchlist),
        "today_disclosures": len(disclosures),
        "bullish": bullish,
        "bearish": bearish,
        "important_disclosures": important[:5],
        "recent_disclosures": disclosures[:10],
    }


@router.get("/history")
async def get_history(days: int = Query(30, ge=1, le=90)):
    all_cached = list_all_cached_full()
    cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")
    by_date: dict[str, list[dict]] = defaultdict(list)
    for item in all_cached:
        dt = item.get("rcept_dt", "")
        if dt >= cutoff:
            by_date[dt].append(item.get("analysis", {}))
    history = []
    for date in sorted(by_date.keys()):
        analyses = by_date[date]
        scores = [a.get("importance_score", 0) for a in analyses]
        avg_score = round(sum(scores) / len(scores)) if scores else 0
        bullish = sum(1 for a in analyses if a.get("category") == "호재")
        bearish = sum(1 for a in analyses if a.get("category") == "악재")
        history.append({
            "date": date,
            "count": len(analyses),
            "avg_score": avg_score,
            "bullish": bullish,
            "bearish": bearish,
        })
    return {"history": history}
