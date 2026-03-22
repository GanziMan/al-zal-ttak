"""AI 분석 결과 캐싱 (rcept_no 기준, JSON 파일)"""
from __future__ import annotations

import json
from pathlib import Path

CACHE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "analysis_cache"


def _cache_path(rcept_no: str) -> Path:
    return CACHE_DIR / f"{rcept_no}.json"


def get_cached_analysis(rcept_no: str) -> dict | None:
    path = _cache_path(rcept_no)
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("analysis", data)


def save_analysis(rcept_no: str, analysis: dict, metadata: dict | None = None):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    data = {"analysis": analysis}
    if metadata:
        data.update(metadata)
    with open(_cache_path(rcept_no), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_cached_full(rcept_no: str) -> dict | None:
    path = _cache_path(rcept_no)
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if "analysis" not in data:
        return None
    return data


def list_all_cached_full() -> list[dict]:
    if not CACHE_DIR.exists():
        return []
    results = []
    for p in CACHE_DIR.glob("*.json"):
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "analysis" in data and "rcept_dt" in data:
            data["rcept_no"] = p.stem
            results.append(data)
    return results


def list_cached() -> list[str]:
    if not CACHE_DIR.exists():
        return []
    return [p.stem for p in CACHE_DIR.glob("*.json")]


def search_similar(
    category: str,
    keywords: list[str],
    exclude_rcept_no: str,
    limit: int = 5,
) -> list[dict]:
    all_cached = list_all_cached_full()
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
