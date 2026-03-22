"""북마크 API"""
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.bookmarks import load_bookmarks, add_bookmark, remove_bookmark, update_memo

router = APIRouter()


class AddBookmarkRequest(BaseModel):
    rcept_no: str
    corp_name: str
    report_nm: str
    memo: Optional[str] = ""


class UpdateMemoRequest(BaseModel):
    memo: str


@router.get("")
async def get_bookmarks():
    return {"bookmarks": await load_bookmarks()}


@router.post("")
async def create_bookmark(req: AddBookmarkRequest):
    bookmarks = await add_bookmark(req.rcept_no, req.corp_name, req.report_nm, req.memo or "")
    return {"bookmarks": bookmarks}


@router.delete("/{rcept_no}")
async def delete_bookmark(rcept_no: str):
    bookmarks = await remove_bookmark(rcept_no)
    return {"bookmarks": bookmarks}


@router.patch("/{rcept_no}/memo")
async def patch_memo(rcept_no: str, req: UpdateMemoRequest):
    bookmarks = await update_memo(rcept_no, req.memo)
    return {"bookmarks": bookmarks}
