# 알공딱 (ALZALTTAK) — 서비스 스펙 문서

> AI 기반 한국 주식시장 공시 분석 서비스
> Version 0.2.0

---

## 1. 서비스 개요

### 1.1 목적

한국 주식시장의 DART(전자공시시스템) 공시를 자동 수집하고, AI(Google Gemini)로 분석하여 **호재/악재/중립/단순정보**로 분류, 중요도를 0~100으로 점수화한다. 사용자는 관심종목의 공시를 실시간으로 모니터링하고, 조건에 맞는 공시 발생 시 텔레그램 알림을 받을 수 있다.

### 1.2 핵심 기능

| 기능          | 설명                                                |
| ------------- | --------------------------------------------------- |
| 관심종목 관리 | DART 상장기업 검색, 관심종목 추가/삭제              |
| 공시 피드     | 관심종목 공시 자동 수집, 필터링(카테고리/기간/점수) |
| AI 분석       | Gemini 2.5 Flash로 공시 분류·요약·중요도 점수화     |
| 대시보드      | 오늘 공시 현황, 호재/악재 카운트, 주요 공시 Top 5   |
| 텔레그램 알림 | 조건 충족 공시 분석 완료 시 자동 알림 전송          |
| 자동 스캔     | 30분 간격 백그라운드 공시 스캔 및 분석              |
| 다크 모드     | 라이트/다크 테마 전환, localStorage 영속            |

### 1.3 사용자 흐름

```
관심종목 추가 → 공시 자동 수집 → AI 분석 (백그라운드)
    ↓                                    ↓
대시보드에서 현황 확인          텔레그램 알림 수신
    ↓
공시 페이지에서 상세 분석 확인 → DART 원문 링크로 이동
```

---

## 2. 기술 스택

### 2.1 Frontend

| 항목          | 기술                 | 버전    |
| ------------- | -------------------- | ------- |
| 프레임워크    | Next.js (App Router) | 16.2.1  |
| UI 라이브러리 | React                | 19.2.4  |
| 언어          | TypeScript           | 5.x     |
| 스타일링      | Tailwind CSS         | 4.x     |
| 컴포넌트      | shadcn/ui + Base UI  | -       |
| 아이콘        | Lucide React         | 0.577.0 |
| 토스트        | Sonner               | 2.0.7   |
| 색상 시스템   | OKLCH                | -       |

### 2.2 Backend

| 항목            | 기술                               | 버전     |
| --------------- | ---------------------------------- | -------- |
| 프레임워크      | FastAPI                            | ≥0.115.0 |
| 런타임          | Python + uvicorn                   | -        |
| HTTP 클라이언트 | httpx                              | ≥0.27.0  |
| AI 프레임워크   | Google ADK (Agent Development Kit) | ≥0.3.0   |
| AI 모델         | Gemini 2.5 Flash                   | -        |
| 검증            | Pydantic                           | ≥2.0     |
| 알림            | Telegram Bot API (httpx)           | -        |

### 2.3 데이터 저장소

현재 JSON 파일 기반 (DB 마이그레이션 예정)

| 데이터        | 경로                                  |
| ------------- | ------------------------------------- |
| 관심종목      | `data/watchlist.json`                 |
| 설정          | `data/settings.json`                  |
| 기업코드 캐시 | `data/corp_codes.json`                |
| AI 분석 캐시  | `data/analysis_cache/{rcept_no}.json` |

### 2.4 외부 API

| API                                 | 용도                              |
| ----------------------------------- | --------------------------------- |
| DART OpenAPI (`opendart.fss.or.kr`) | 공시 목록 조회, 기업코드 다운로드 |
| Google Gemini API                   | 공시 AI 분석                      |
| Telegram Bot API                    | 알림 전송                         |

---

## 3. 아키텍처

### 3.1 시스템 구성도

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js 16)              │
│  ┌──────┐ ┌──────────┐ ┌────┐ ┌────┐           │
│  │대시보드│ │공시 피드  │ │관심│ │설정│           │
│  │      │ │(필터/폴링)│ │종목│ │    │           │
│  └──┬───┘ └────┬─────┘ └─┬──┘ └─┬──┘           │
│     └──────────┴─────────┴──────┘               │
│                    │ fetch()                     │
└────────────────────┼────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────┐
│              Backend (FastAPI)                   │
│                    │                             │
│  ┌─────────────────┼─────────────────────┐      │
│  │            5개 API Router              │      │
│  │  /corps  /watchlist  /disclosures     │      │
│  │  /dashboard  /settings                │      │
│  └─────────────────┬─────────────────────┘      │
│                    │                             │
│  ┌─────────────────┼─────────────────────┐      │
│  │           Service Layer               │      │
│  │  DartClient  DisclosureFilter         │      │
│  │  Watchlist   Settings                 │      │
│  │  AnalysisCache  CorpCodeLoader        │      │
│  │  Telegram                             │      │
│  └─────────────────┬─────────────────────┘      │
│                    │                             │
│  ┌─────────────────┼─────────────────────┐      │
│  │           AI Agent Layer              │      │
│  │  Categorizer (Gemini 2.5 Flash)       │      │
│  │  Runner (Google ADK)                  │      │
│  └───────────────────────────────────────┘      │
│                                                  │
│  ┌───────────────────────────────────────┐      │
│  │     Background Services               │      │
│  │  - 배치 분석 (동시 5건)               │      │
│  │  - 자동 스캔 (30분 간격)              │      │
│  │  - 텔레그램 알림                      │      │
│  └───────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
          │              │              │
    ┌─────┴────┐  ┌──────┴─────┐  ┌────┴────┐
    │ DART API │  │ Gemini API │  │Telegram │
    └──────────┘  └────────────┘  └─────────┘
```

### 3.2 디렉토리 구조

```
al-gong-ttak/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # 루트 레이아웃 (Toaster, 다크모드 스크립트)
│   │   │   ├── page.tsx                # 대시보드
│   │   │   ├── globals.css             # CSS 변수 (라이트/다크)
│   │   │   ├── disclosures/page.tsx    # 공시 피드
│   │   │   ├── watchlist/page.tsx      # 관심종목 관리
│   │   │   └── settings/page.tsx       # 설정
│   │   ├── components/
│   │   │   ├── nav.tsx                 # 네비게이션 + 테마 토글
│   │   │   ├── disclosure-card.tsx     # 공시 카드 (DART 링크, AI 분석)
│   │   │   ├── disclosure-filters.tsx  # 필터 셀렉트 (카테고리/기간/점수)
│   │   │   ├── important-disclosures.tsx # 주요공시 + 최신공시 위젯
│   │   │   ├── summary-cards.tsx       # 대시보드 요약 카드
│   │   │   ├── stock-search.tsx        # 종목 검색 (디바운스)
│   │   │   ├── watchlist-table.tsx     # 관심종목 테이블
│   │   │   └── ui/                     # shadcn 컴포넌트
│   │   └── lib/
│   │       ├── api.ts                  # API 클라이언트 + 타입 정의
│   │       ├── disclosure-utils.ts     # 카테고리 색상, 날짜 포맷
│   │       └── utils.ts               # cn() 유틸리티
│   ├── package.json
│   └── next.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI 앱, 라이프사이클, 자동스캔
│   │   ├── config.py                   # 환경변수 설정
│   │   ├── routers/
│   │   │   ├── corp_search_api.py      # GET /api/corps/search
│   │   │   ├── watchlist_api.py        # CRUD /api/watchlist
│   │   │   ├── disclosure_api.py       # GET /api/disclosures + 배치분석
│   │   │   ├── dashboard_api.py        # GET /api/dashboard/summary
│   │   │   └── settings_api.py         # GET/PUT /api/settings
│   │   ├── services/
│   │   │   ├── dart_client.py          # DART OpenAPI 클라이언트
│   │   │   ├── disclosure_filter.py    # 관심종목 공시 필터링
│   │   │   ├── watchlist.py            # 관심종목 JSON 저장소
│   │   │   ├── settings.py             # 설정 JSON 저장소
│   │   │   ├── analysis_cache.py       # AI 분석 결과 캐시
│   │   │   ├── corp_code_loader.py     # DART 기업코드 다운로드/캐시
│   │   │   └── telegram.py             # 텔레그램 알림 전송
│   │   └── agents/
│   │       ├── categorizer.py          # AI 분류 에이전트 (프롬프트 + 스키마)
│   │       └── runner.py               # ADK Runner (세션 관리)
│   └── requirements.txt
├── bot/
│   └── telegram_bot.py                 # (레거시) 텔레그램 봇
└── data/                               # 런타임 데이터 (JSON)
```

---

## 4. API 명세

### 4.1 기업 검색

#### `GET /api/corps/search`

DART 상장기업을 이름으로 검색한다.

| 파라미터 | 타입   | 필수 | 설명                  |
| -------- | ------ | ---- | --------------------- |
| `q`      | string | O    | 검색 키워드 (min 1자) |

**응답**

```json
{
  "results": [
    {
      "corp_code": "00126380",
      "corp_name": "삼성전자",
      "stock_code": "005930"
    }
  ]
}
```

- 최대 20건 반환
- 대소문자 구분 없음

---

### 4.2 관심종목

#### `GET /api/watchlist`

관심종목 목록을 조회한다.

**응답**

```json
{
  "watchlist": [
    {
      "corp_code": "00126380",
      "corp_name": "삼성전자",
      "stock_code": "005930"
    }
  ]
}
```

#### `POST /api/watchlist`

관심종목을 추가한다.

**요청**

```json
{
  "corp_code": "00126380",
  "corp_name": "삼성전자",
  "stock_code": "005930"
}
```

**응답**: 업데이트된 전체 관심종목 목록. 이미 존재하면 중복 추가하지 않음.

#### `DELETE /api/watchlist/{corp_code}`

관심종목을 삭제한다.

**응답**: 업데이트된 전체 관심종목 목록.

---

### 4.3 공시 피드

#### `GET /api/disclosures`

관심종목의 공시를 조회하고 AI 분석을 첨부한다.

| 파라미터    | 타입        | 기본값 | 설명                                    |
| ----------- | ----------- | ------ | --------------------------------------- |
| `days`      | int (1~30)  | 7      | 조회 기간                               |
| `category`  | string      | null   | 카테고리 필터 (호재/악재/중립/단순정보) |
| `min_score` | int (0~100) | 0      | 최소 중요도 점수                        |

**응답**

```json
{
  "disclosures": [
    {
      "rcept_no": "20240101000001",
      "rcept_dt": "20240101",
      "corp_name": "삼성전자",
      "corp_code": "00126380",
      "report_nm": "주요사항보고서(자기주식취득결정)",
      "flr_nm": "삼성전자",
      "_watchlist_name": "삼성전자",
      "analysis": {
        "category": "호재",
        "importance_score": 75,
        "summary": "삼성전자가 자사주 매입을 결정...",
        "action_item": "자사주 매입은 주주환원 정책의 일환으로 긍정적"
      }
    }
  ],
  "total": 15,
  "pending_analysis": 3
}
```

**동작 방식**

1. DART API로 관심종목별 공시를 조회
2. 캐시된 AI 분석만 즉시 첨부하여 반환 (빠른 응답)
3. 미분석 건은 백그라운드 태스크로 분석 시작 (동시 5건 제한)
4. `pending_analysis > 0`이면 프론트엔드가 5초 간격으로 폴링
5. 분석 완료 시 텔레그램 알림 조건 확인 후 전송

---

### 4.4 대시보드

#### `GET /api/dashboard/summary`

오늘의 공시 요약 데이터를 반환한다.

**응답**

```json
{
  "watchlist_count": 5,
  "today_disclosures": 12,
  "bullish": 3,
  "bearish": 1,
  "important_disclosures": [],
  "recent_disclosures": []
}
```

| 필드                    | 설명                  |
| ----------------------- | --------------------- |
| `watchlist_count`       | 관심종목 수           |
| `today_disclosures`     | 오늘 공시 건수        |
| `bullish`               | 호재 건수             |
| `bearish`               | 악재 건수             |
| `important_disclosures` | 중요도 50+ 공시 Top 5 |
| `recent_disclosures`    | 최신 공시 Top 10      |

---

### 4.5 설정

#### `GET /api/settings`

현재 설정을 조회한다.

#### `PUT /api/settings`

설정을 업데이트한다 (부분 업데이트 지원).

**설정 스키마**

```json
{
  "telegram_enabled": true,
  "telegram_chat_id": "",
  "min_importance_score": 30,
  "categories": ["호재", "악재", "중립", "단순정보"],
  "alert_categories": ["호재", "악재"],
  "disclosure_days": 7
}
```

| 필드                   | 타입     | 기본값          | 설명                 |
| ---------------------- | -------- | --------------- | -------------------- |
| `telegram_enabled`     | boolean  | true            | 텔레그램 알림 ON/OFF |
| `telegram_chat_id`     | string   | ""              | 텔레그램 채팅 ID     |
| `min_importance_score` | int      | 30              | 알림 최소 중요도     |
| `alert_categories`     | string[] | ["호재","악재"] | 알림 대상 카테고리   |
| `disclosure_days`      | int      | 7               | 공시 기본 조회 기간  |

---

### 4.6 헬스체크

#### `GET /health`

```json
{ "status": "ok" }
```

---

## 5. AI 분석 스펙

### 5.1 모델

- **Google Gemini 2.5 Flash** (Google ADK 경유)
- 구조화된 출력 (Pydantic 스키마)

### 5.2 출력 스키마

```python
class DisclosureAnalysis:
    category: str          # "호재" | "악재" | "중립" | "단순정보"
    importance_score: int   # 0~100
    summary: str           # 3줄 이내 요약
    action_item: str       # 한 줄 결론
```

### 5.3 분류 기준

| 카테고리 | 판단 기준                                      |
| -------- | ---------------------------------------------- |
| 호재     | 매출 증가, 신사업 진출, 배당 확대, 자사주 매입 |
| 악재     | 적자 전환, 유상증자, 대표 횡령, 소송 패소      |
| 중립     | 임원 변동, 정기 주총 결과                      |
| 단순정보 | 정기 보고서, 사업보고서                        |

### 5.4 중요도 점수 기준

| 점수 범위 | 의미                |
| --------- | ------------------- |
| 80~100    | 당장 주가에 큰 영향 |
| 50~79     | 중기적 영향 가능성  |
| 20~49     | 참고 수준           |
| 0~19      | 형식적/정기적 공시  |

### 5.5 입력 형식

```
[종목명] {corp_name}
[공시 제목] {title}
[공시 내용]
{corp_name} {title} (접수일: {rcept_dt})
```

### 5.6 분석 캐시

- 접수번호(`rcept_no`) 단위로 JSON 파일 캐시
- 동일 공시 재분석 방지
- 경로: `data/analysis_cache/{rcept_no}.json`

---

## 6. 백그라운드 서비스

### 6.1 배치 분석 (on-demand)

- **트리거**: `/api/disclosures` 호출 시 미분석 건 감지
- **동시성**: `asyncio.Semaphore(5)` — 최대 5건 병렬
- **방식**: fire-and-forget (`asyncio.create_task`)
- **완료 후**: 캐시 저장 + 텔레그램 알림 조건 확인

### 6.2 자동 스캔 (scheduled)

- **간격**: 30분
- **범위**: 1일치 공시
- **처리**: 순차 (한 건씩) — API 쿼터 부하 최소화
- **흐름**: 공시 수집 → 미분석 필터 → AI 분석 → 텔레그램 알림

### 6.3 텔레그램 알림

- **조건**: `telegram_enabled` AND `chat_id` 설정 AND `bot_token` 환경변수
- **필터**: `category ∈ alert_categories` AND `importance_score ≥ min_importance_score`
- **형식**: Markdown (카테고리 이모지 + 제목 + 분류/중요도 + 요약 + 결론 + DART 링크)
- **에러 처리**: 로깅만 (실패해도 분석 흐름 중단 없음)

---

## 7. 프론트엔드 상세

### 7.1 페이지 구성

| 경로           | 페이지    | 주요 기능                                                |
| -------------- | --------- | -------------------------------------------------------- |
| `/`            | 대시보드  | 요약 카드 4개, 주요 공시 Top 5, 최신 공시 Top 10         |
| `/watchlist`   | 관심종목  | 종목 검색(디바운스 300ms), 추가/삭제, 테이블             |
| `/disclosures` | 공시 피드 | 필터(카테고리/기간/점수), URL 동기화, 폴링, DART 링크    |
| `/settings`    | 설정      | 텔레그램 ON/OFF, 채팅ID, 알림 카테고리, 중요도, 조회기간 |

### 7.2 URL 파라미터 (공시 페이지)

| 파라미터    | 용도           | 예시                              |
| ----------- | -------------- | --------------------------------- |
| `corp_code` | 특정 종목 필터 | `/disclosures?corp_code=00126380` |
| `category`  | 카테고리 필터  | `/disclosures?category=호재`      |
| `days`      | 조회 기간      | `/disclosures?days=14`            |
| `min_score` | 최소 점수      | `/disclosures?min_score=50`       |

필터 변경 시 URL이 자동 갱신되어 공유 가능한 링크 생성.

### 7.3 실시간 폴링

- `pending_analysis > 0`이면 5초 간격 자동 재조회
- `pending_analysis`가 >0 → 0 전환 시 "AI 분석 완료" 토스트

### 7.4 토스트 알림 (Sonner)

| 이벤트        | 메시지                           |
| ------------- | -------------------------------- |
| 관심종목 추가 | `"{종목명} 추가됨"`              |
| 관심종목 삭제 | `"{종목명} 삭제됨"`              |
| 설정 저장     | `"설정이 저장되었습니다"`        |
| AI 분석 완료  | `"AI 분석 완료"`                 |
| 에러          | `"종목 추가에 실패했습니다."` 등 |

### 7.5 다크 모드

- **저장**: `localStorage.setItem("theme", "dark" | "light")`
- **초기화**: `beforeInteractive` 스크립트로 FOUC 방지
- **토글**: 네비게이션 우측 Moon/Sun 아이콘 버튼
- **CSS**: `.dark` 클래스 기반, OKLCH 색상 변수 전환

### 7.6 디자인 시스템

**색상 (OKLCH 기반)**
| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `--background` | 0.985 | 0.13 |
| `--foreground` | 0.15 | 0.93 |
| `--card` | 1.0 (white) | 0.17 |
| `--primary` | 0.35 (deep purple) | 0.65 (light purple) |
| `--border` | 0.90 | 0.25 |
| `--muted-foreground` | 0.45 | 0.60 |

**카테고리 색상**
| 카테고리 | 배경 | 텍스트 | 테두리 | 점수 색상 기준 |
|----------|------|--------|--------|---------------|
| 호재 | emerald-50 | emerald-700 | emerald-500 | 80+ red |
| 악재 | red-50 | red-700 | red-500 | 50+ amber |
| 중립 | amber-50 | amber-700 | amber-500 | 20+ blue |
| 단순정보 | zinc-100 | zinc-600 | zinc-300 | 0+ zinc |

**타이포그래피**

- 본문: Geist Sans
- 코드: Geist Mono
- 크기: 10px~21px (text-[10px] ~ text-xl)

**Border Radius**: 0.625rem 기반 (`rounded-lg` = `var(--radius)`)

---

## 8. 환경 변수

### 8.1 Backend (`.env`)

| 변수                 | 필수 | 설명                                                  |
| -------------------- | ---- | ----------------------------------------------------- |
| `DART_API_KEY`       | O    | DART OpenAPI 인증키                                   |
| `LLM_API_KEY`        | O    | Google Gemini API 키                                  |
| `TELEGRAM_BOT_TOKEN` | -    | 텔레그램 봇 토큰                                      |
| `TELEGRAM_CHAT_ID`   | -    | 텔레그램 채팅 ID                                      |
| `DATABASE_URL`       | -    | DB URL (기본: `sqlite+aiosqlite:///./al_zal_ttak.db`) |

### 8.2 Frontend (`.env.local`)

| 변수                  | 필수 | 설명                                       |
| --------------------- | ---- | ------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | -    | 백엔드 URL (기본: `http://localhost:8000`) |

---

## 9. 실행 방법

### 9.1 Backend

```bash
cd backend
pip install -r requirements.txt
# .env 파일에 DART_API_KEY, LLM_API_KEY 설정
uvicorn app.main:app --reload
```

서버: `http://localhost:8000`

### 9.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

서버: `http://localhost:3000`

---

## 10. CORS 설정

| Origin                           | 환경      |
| -------------------------------- | --------- |
| `http://localhost:3000`          | 로컬 개발 |
| `https://al-gong-ttak.vercel.app` | 프로덕션  |

---

## 11. 데이터 모델

### 11.1 Corp (기업)

```typescript
{
  corp_code: string; // DART 기업코드 (8자리)
  corp_name: string; // 기업명
  stock_code: string; // 종목코드 (6자리)
}
```

### 11.2 WatchlistItem (관심종목)

```typescript
{
  corp_code: string;
  corp_name: string;
  stock_code: string;
}
```

### 11.3 Disclosure (공시)

```typescript
{
  rcept_no: string; // DART 접수번호
  rcept_dt: string; // 접수일 (YYYYMMDD)
  corp_name: string; // 기업명
  corp_code: string; // 기업코드
  report_nm: string; // 공시 제목
  flr_nm: string; // 공시 제출인
  _watchlist_name: string; // 관심종목 이름
  analysis: DisclosureAnalysis | null;
}
```

### 11.4 DisclosureAnalysis (AI 분석)

```typescript
{
  category: "호재" | "악재" | "중립" | "단순정보";
  importance_score: number; // 0~100
  summary: string; // 3줄 이내 요약
  action_item: string; // 한 줄 결론
}
```

### 11.5 AppSettings (설정)

```typescript
{
  telegram_enabled: boolean
  telegram_chat_id: string
  min_importance_score: number
  categories: string[]
  alert_categories: string[]
  disclosure_days: number
}
```

### 11.6 DashboardSummary (대시보드)

```typescript
{
  watchlist_count: number
  today_disclosures: number
  bullish: number
  bearish: number
  important_disclosures: Disclosure[]
  recent_disclosures: Disclosure[]
}
```

---

## 12. 알려진 제한사항 및 향후 계획

### 현재 제한사항

- JSON 파일 기반 저장소 (동시성 이슈 가능)
- DART API 호출 제한 (IP당 일 10,000건)
- AI 분석 시 공시 본문이 아닌 제목+메타데이터만 사용
- 프론트엔드 인증/사용자 시스템 없음
- 모바일 앱 미지원 (반응형 웹만)

### 향후 계획

- [ ] SQLite/PostgreSQL DB 마이그레이션
- [ ] 공시 본문 크롤링으로 AI 분석 정확도 향상
- [ ] 사용자 인증 (다중 사용자 지원)
- [ ] 주가 차트 연동
- [ ] 공시 알림 히스토리
- [ ] PWA 지원
