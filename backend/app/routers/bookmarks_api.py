"""북마크 API"""
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models.user import User
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
async def get_bookmarks(user: User = Depends(get_current_user)):
    return {"bookmarks": await load_bookmarks(user.id)}


@router.post("")
async def create_bookmark(req: AddBookmarkRequest, user: User = Depends(get_current_user)):
    bookmarks = await add_bookmark(user.id, req.rcept_no, req.corp_name, req.report_nm, req.memo or "")
    return {"bookmarks": bookmarks}


@router.delete("/{rcept_no}")
async def delete_bookmark(rcept_no: str, user: User = Depends(get_current_user)):
    bookmarks = await remove_bookmark(user.id, rcept_no)
    return {"bookmarks": bookmarks}


@router.patch("/{rcept_no}/memo")
async def patch_memo(rcept_no: str, req: UpdateMemoRequest, user: User = Depends(get_current_user)):
    bookmarks = await update_memo(user.id, rcept_no, req.memo)
    return {"bookmarks": bookmarks}
