"""북마크/메모 관리 (JSON 파일 기반)"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

BOOKMARKS_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "bookmarks.json"


def load_bookmarks() -> list[dict]:
    if not BOOKMARKS_PATH.exists():
        return []
    with open(BOOKMARKS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_bookmarks(bookmarks: list[dict]):
    BOOKMARKS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(BOOKMARKS_PATH, "w", encoding="utf-8") as f:
        json.dump(bookmarks, f, ensure_ascii=False, indent=2)


def add_bookmark(rcept_no: str, corp_name: str, report_nm: str, memo: str = "") -> list[dict]:
    bookmarks = load_bookmarks()
    if any(b["rcept_no"] == rcept_no for b in bookmarks):
        return bookmarks
    bookmarks.append({
        "rcept_no": rcept_no,
        "corp_name": corp_name,
        "report_nm": report_nm,
        "memo": memo,
        "created_at": datetime.now().isoformat(),
    })
    save_bookmarks(bookmarks)
    return bookmarks


def remove_bookmark(rcept_no: str) -> list[dict]:
    bookmarks = load_bookmarks()
    bookmarks = [b for b in bookmarks if b["rcept_no"] != rcept_no]
    save_bookmarks(bookmarks)
    return bookmarks


def update_memo(rcept_no: str, memo: str) -> list[dict]:
    bookmarks = load_bookmarks()
    for b in bookmarks:
        if b["rcept_no"] == rcept_no:
            b["memo"] = memo
            break
    save_bookmarks(bookmarks)
    return bookmarks
