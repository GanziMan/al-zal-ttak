"""업종별 기업 그룹핑 (정적 매핑)"""
from __future__ import annotations

from app.services.corp_code_loader import _corps_cache, load_cached_corps

# 업종별 대표 기업 (corp_name 기준)
_SECTOR_CORPS: dict[str, list[str]] = {
    "반도체": ["삼성전자", "SK하이닉스", "DB하이텍", "리노공업", "한미반도체", "이오테크닉스", "주성엔지니어링"],
    "자동차": ["현대자동차", "기아", "현대모비스", "만도", "한온시스템", "HL만도", "현대위아"],
    "금융": ["KB금융", "신한지주", "하나금융지주", "우리금융지주", "삼성생명", "삼성화재", "메리츠금융지주"],
    "IT/플랫폼": ["네이버", "카카오", "엔씨소프트", "크래프톤", "카카오뱅크", "카카오페이", "두나무"],
    "바이오": ["삼성바이오로직스", "셀트리온", "SK바이오사이언스", "유한양행", "한미약품", "녹십자", "대웅제약"],
    "에너지/화학": ["LG화학", "LG에너지솔루션", "SK이노베이션", "에코프로비엠", "포스코퓨처엠", "삼성SDI", "에코프로"],
    "유통/소비재": ["삼성물산", "LG생활건강", "아모레퍼시픽", "CJ제일제당", "오리온", "BGF리테일", "GS리테일"],
    "건설/인프라": ["현대건설", "삼성엔지니어링", "GS건설", "대우건설", "DL이앤씨", "HDC현대산업개발", "포스코건설"],
    "엔터테인먼트": ["하이브", "SM", "JYP Ent.", "CJ ENM", "스튜디오드래곤", "에스엠", "와이지엔터테인먼트"],
}


async def get_sectors() -> list[dict]:
    if not _corps_cache:
        await load_cached_corps()

    # corp_name → corp_code, stock_code 매핑
    name_map: dict[str, dict] = {}
    for c in _corps_cache:
        name_map[c["corp_name"]] = c

    sectors = []
    for sector_name, corp_names in _SECTOR_CORPS.items():
        corps = []
        for name in corp_names:
            info = name_map.get(name)
            if info:
                corps.append({
                    "corp_code": info["corp_code"],
                    "corp_name": info["corp_name"],
                    "stock_code": info["stock_code"],
                })
        if corps:
            sectors.append({"name": sector_name, "corps": corps})

    return sectors
