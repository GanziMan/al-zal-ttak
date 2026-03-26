"""기업 검색 API"""
from __future__ import annotations

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.services.corp_code_loader import search_corps
from app.services.popular_stocks import get_popular_stocks
from app.services.sector_mapping import get_sectors

router = APIRouter()


@router.get("/search")
async def search(q: str = Query(..., min_length=1, description="검색 키워드")):
    results = await search_corps(q)
    return JSONResponse(
        content={"results": results},
        headers={"Cache-Control": "public, max-age=30"},
    )


@router.get("/popular")
async def popular(limit: int = Query(10, ge=1, le=30)):
    stocks = await get_popular_stocks(limit=limit)
    return {"stocks": stocks}


@router.get("/sectors")
async def sectors():
    data = await get_sectors()
    return {"sectors": data}
