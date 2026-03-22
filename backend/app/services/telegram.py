"""텔레그램 알림 서비스"""
from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)


async def send_alert(bot_token: str, chat_id: str, message: str) -> None:
    """텔레그램으로 알림 전송."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown",
            })
            resp.raise_for_status()
    except Exception:
        logger.exception("Telegram alert failed")


def format_keyword_alert(keyword: str, disclosures: list[dict]) -> str:
    """키워드 매칭 공시 알림 메시지 포맷."""
    lines = [f"\U0001f50d 키워드 알림: *{keyword}*\n"]
    for d in disclosures[:10]:
        corp = d.get("corp_name", "")
        title = d.get("report_nm", "")
        rcept_no = d.get("rcept_no", "")
        link = f"https://dart.fss.or.kr/dsaf001/main.do?rcept_no={rcept_no}" if rcept_no else ""
        lines.append(f"\u2022 {corp} — [{title}]({link})" if link else f"\u2022 {corp} — {title}")
    if len(disclosures) > 10:
        lines.append(f"\n... 외 {len(disclosures) - 10}건")
    return "\n".join(lines)


def format_disclosure_alert(
    corp_name: str,
    title: str,
    category: str,
    importance: int,
    summary: str,
    action_item: str,
    rcept_no: str = "",
) -> str:
    """공시 알림 메시지 포맷 (DART 원문 링크 포함)."""
    emoji = {"호재": "\U0001f7e2", "악재": "\U0001f534", "중립": "\u26aa", "단순정보": "\u2139\ufe0f"}.get(
        category, "\U0001f4cb"
    )

    dart_link = ""
    if rcept_no:
        dart_link = f"\n\n[DART 원문 보기](https://dart.fss.or.kr/dsaf001/main.do?rcept_no={rcept_no})"

    return f"""{emoji} *{corp_name}* 공시 알림

\U0001f4cc *{title}*
분류: {category} | 중요도: {importance}/100

\U0001f4dd 요약:
{summary}

\U0001f4a1 결론: {action_item}{dart_link}""".strip()
