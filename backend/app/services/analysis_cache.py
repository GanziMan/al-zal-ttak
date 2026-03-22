"""AI 분석 결과 캐싱 (DB 기반)"""
from __future__ import annotations

from sqlalchemy import select
from app.database import async_session
from app.models.analysis_cache import AnalysisCache


async def get_cached_analysis(rcept_no: str) -> dict | None:
    async with async_session() as session:
        row = await session.get(AnalysisCache, rcept_no)
        if not row:
            return None
        return row.analysis


async def save_analysis(rcept_no: str, analysis: dict, metadata: dict | None = None):
    async with async_session() as session:
        row = await session.get(AnalysisCache, rcept_no)
        if not row:
            row = AnalysisCache(rcept_no=rcept_no)
            session.add(row)
        row.analysis = analysis
        if metadata:
            row.rcept_dt = metadata.get("rcept_dt", "")
            row.corp_name = metadata.get("corp_name", "")
            row.report_nm = metadata.get("report_nm", "")
        await session.commit()


async def get_cached_full(rcept_no: str) -> dict | None:
    async with async_session() as session:
        row = await session.get(AnalysisCache, rcept_no)
        if not row or not row.analysis:
            return None
        return {
            "rcept_no": row.rcept_no,
            "rcept_dt": row.rcept_dt,
            "corp_name": row.corp_name,
            "report_nm": row.report_nm,
            "analysis": row.analysis,
        }


async def list_all_cached_full() -> list[dict]:
    async with async_session() as session:
        result = await session.execute(
            select(AnalysisCache).where(AnalysisCache.rcept_dt != "")
        )
        rows = result.scalars().all()
        return [
            {
                "rcept_no": r.rcept_no,
                "rcept_dt": r.rcept_dt,
                "corp_name": r.corp_name,
                "report_nm": r.report_nm,
                "analysis": r.analysis,
            }
            for r in rows
        ]


async def list_cached() -> list[str]:
    async with async_session() as session:
        result = await session.execute(select(AnalysisCache.rcept_no))
        return [r[0] for r in result.all()]


async def search_similar(
    category: str,
    keywords: list[str],
    exclude_rcept_no: str,
    limit: int = 5,
) -> list[dict]:
    all_cached = await list_all_cached_full()
    scored = []
    for item in all_cached:
        rcept_no = item.get("rcept_no", "")
        if rcept_no == exclude_rcept_no:
            continue
        analysis = item.get("analysis", {})
        if analysis.get("category") != category:
            continue
        report_nm = item.get("report_nm", "")
        match_count = sum(1 for kw in keywords if kw in report_nm)
        if match_count == 0:
            continue
        scored.append({
            "rcept_no": rcept_no,
            "corp_name": item.get("corp_name", ""),
            "report_nm": report_nm,
            "rcept_dt": item.get("rcept_dt", ""),
            "category": analysis.get("category", ""),
            "importance_score": analysis.get("importance_score", 0),
            "summary": analysis.get("summary", ""),
            "_match": match_count,
        })
    scored.sort(key=lambda x: (-x["_match"], -x["importance_score"]))
    for item in scored:
        del item["_match"]
    return scored[:limit]
