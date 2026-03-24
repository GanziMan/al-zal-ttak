# v2 기능 구현 작업 내역

> 작업일: 2026-03-24
> 대상: `product-improvements.md`에서 선정한 6개 기능 (리텐션 / 온보딩 / 분석 깊이)

---

## 구현 완료 기능 요약

| # | 기능 | 분류 | 상태 |
|---|------|------|------|
| 1 | 공시 용어 툴팁 | 온보딩 | 완료 |
| 2 | 인기 종목 추천 | 온보딩 | 완료 |
| 3 | 업종별 그룹핑 | 온보딩 | 완료 |
| 4 | 오늘의 AI 브리핑 | 리텐션 | 완료 |
| 5 | 공시 vs 주가 연동 | 분석 깊이 | 완료 |
| 6 | 비슷한 과거 사례 강화 | 분석 깊이 | 완료 |

---

## Phase 1: 공시 용어 툴팁

**목적:** 금융 초보 유저가 공시 카드를 읽을 때 모르는 용어에 대한 진입장벽 해소

### 신규 파일
- `frontend/src/lib/glossary.ts` — 30개 금융/공시 용어 사전 (유상증자, 전환사채, 감자 등) + longest-match-first 정렬
- `frontend/src/components/glossary-highlight.tsx` — 텍스트 내 용어 자동 매칭 → dashed underline + hover/touch 툴팁

### 수정 파일
- `frontend/src/components/disclosure-card.tsx`
  - `report_nm` (공시 제목), `analysis.summary` (AI 요약), `analysis.action_item` (액션 아이템)에 `<GlossaryHighlight>` 적용

### 동작
- 텍스트에서 용어를 longest match first로 검색하여 `<TermTooltip>`으로 감쌈
- PC: hover 시 정의 표시 / 모바일: tap 시 토글 + 외부 클릭 닫기
- `useMemo`로 segmentText 결과 캐싱

---

## Phase 2: 인기 종목 추천

**목적:** 가입 직후 관심종목 0개 → 대시보드 텅 빈 상태 방지. 많이 추적하는 종목 원클릭 추가

### 신규 파일
- `backend/app/services/popular_stocks.py` — `Watchlist` 테이블에서 `GROUP BY corp_code ORDER BY COUNT(user_id) DESC` 집계
- `frontend/src/components/popular-stocks.tsx` — chip 형태 인기 종목 목록 + Plus/CheckCircle 아이콘

### 수정 파일
- `backend/app/routers/corp_search_api.py` — `GET /api/corps/popular` 엔드포인트 추가
- `frontend/src/lib/api.ts` — `PopularStock` 타입 + `getPopularStocks()` 메서드 추가
- `frontend/src/app/watchlist/page.tsx` — `<StockSearch>` 아래에 `<PopularStocks>` 삽입

### API
```
GET /api/corps/popular?limit=10
→ { "stocks": [{ "corp_code", "corp_name", "stock_code", "watchers" }] }
```

---

## Phase 3: 업종별 그룹핑

**목적:** 개별 종목을 하나씩 검색하지 않고 "반도체" 클릭으로 삼성전자, SK하이닉스 등 한번에 추가

### 신규 파일
- `backend/app/services/sector_mapping.py` — 9개 업종 정적 매핑 (반도체, 자동차, 금융, IT/플랫폼, 바이오, 에너지/화학, 유통/소비재, 건설/인프라, 엔터테인먼트) + `_corps_cache`에서 corp_name → corp_code 변환
- `frontend/src/components/sector-add.tsx` — 업종 chip 선택 → 해당 기업 목록 표시 → 개별 추가 또는 "전체 추가"

### 수정 파일
- `backend/app/routers/corp_search_api.py` — `GET /api/corps/sectors` 엔드포인트 추가
- `frontend/src/lib/api.ts` — `SectorInfo`, `SectorCorp` 타입 + `getSectors()` 메서드 추가
- `frontend/src/app/watchlist/page.tsx` — `<PopularStocks>` 아래에 `<SectorAdd>` 삽입

### API
```
GET /api/corps/sectors
→ { "sectors": [{ "name": "반도체", "corps": [{ "corp_code", "corp_name", "stock_code" }] }] }
```

---

## Phase 4: 오늘의 AI 브리핑

**목적:** 매일 대시보드 접속 시 "어제 공시 중 주목할 것"을 한눈에. 재방문 동기 부여

### 신규 파일
- `backend/app/services/briefing.py` — `AnalysisCache`에서 최근 24시간 공시 집계 (호재/악재/중립 카운트 + 상위 3건 + narrative 생성). 로그인 유저는 관심종목 기준 필터, 비로그인은 전체. 한국 시간대(`Asia/Seoul`) 기준
- `backend/app/routers/briefing_api.py` — `GET /api/briefing/daily` (선택적 인증: 토큰 있으면 관심종목 필터)
- `frontend/src/components/daily-briefing.tsx` — 그라데이션 카드 (`from-primary/5 via-violet-500/5`) + Sparkles 아이콘 + 호재/악재/중립 metric chip + Top 3 공시 + narrative

### 수정 파일
- `backend/app/main.py` — `briefing_api` 라우터 등록 (`prefix="/api/briefing"`)
- `frontend/src/lib/api.ts` — `DailyBriefing` 타입 + `getDailyBriefing()` 메서드 추가
- `frontend/src/app/home-client.tsx` — `Dashboard` 컴포넌트 내 `<SummaryCards>` 위에 `<DailyBriefing />` 삽입

### API
```
GET /api/briefing/daily
→ { "date", "total", "bullish", "bearish", "neutral", "top_disclosures": [...], "narrative" }
```

---

## Phase 5: 공시 vs 주가 연동

**목적:** 공시 발표일 전후 주가 변동을 함께 보여주어 AI 분석의 신뢰도 체감. 30일 주가 차트 + 공시별 주가 영향 배지

### 신규 파일
- `backend/app/services/stock_price.py`
  - `_fetch_naver_prices()` — 네이버 금융 일별 시세 크롤링 (BeautifulSoup HTML 파싱)
  - `get_stock_prices()` — `FinancialData` 모델 재활용하여 6시간 TTL DB 캐시 + 미스 시 크롤링
  - `calculate_price_impact()` — 공시일 전후 1일/3일/5일 주가 변동률 계산
  - 네이버 동시 크롤링 제한 `asyncio.Semaphore(3)`
- `frontend/src/components/stock-chart-inner.tsx` — recharts `LineChart` + `Line` + `XAxis` + `YAxis` + `Tooltip` (SSR-safe 래퍼)
- `frontend/src/components/stock-price-chart.tsx` — `dynamic import` + 30일 종가 라인 차트 (glass-card)
- `frontend/src/components/price-impact-badge.tsx` — 공시별 주가 영향 배지 (+3.2% / -1.5%) + TrendingUp/Down 아이콘 + `visible` prop으로 lazy load (카드 확장 시에만 API 호출)

### 수정 파일
- `backend/app/routers/financial_api.py` — `GET /api/company/{corp_code}/stock-price?days=30` 엔드포인트 추가
- `backend/app/routers/disclosure_api.py` — `GET /api/disclosures/{rcept_no}/price-impact` 엔드포인트 추가
- `frontend/src/lib/api.ts` — `StockPriceDay`, `PriceImpact` 타입 + `getStockPrices()`, `getPriceImpact()` 메서드 추가
- `frontend/src/app/company/[corp_code]/page.tsx` — 기업 헤더 아래에 `<StockPriceChart>` 추가
- `frontend/src/components/disclosure-card.tsx` — 카테고리 배지 옆에 `<PriceImpactBadge>` 추가 (확장 시에만 로드)

### API
```
GET /api/company/{corp_code}/stock-price?days=30
→ { "prices": [{ "date", "close", "open", "high", "low", "volume", "change" }] }

GET /api/disclosures/{rcept_no}/price-impact
→ { "impact": { "before_price", "after_price", "change_1d", "change_3d", "change_5d", "prices" } | null }
```

---

## Phase 6: 비슷한 과거 사례 강화

**목적:** 기존 키워드 매칭 기반 유사 공시에 주가 변동 데이터를 추가하여 "과거 유사 공시 때 주가가 어떻게 움직였는지" 제공

### 수정 파일
- `backend/app/services/analysis_cache.py`
  - `search_similar_with_impact()` 함수 추가: 기존 `search_similar()` 결과에 대해 각각 `calculate_price_impact()` 호출 → `price_change_5d` 필드 추가 + 평균 주가 변동 계산
- `backend/app/routers/disclosure_api.py`
  - `GET /{rcept_no}/similar` 응답에 `avg_price_change` 필드 추가
  - `search_similar` → `search_similar_with_impact` 호출로 변경
- `frontend/src/lib/api.ts`
  - `SimilarDisclosure`에 `price_change_5d: number | null` 필드 추가
  - `getSimilarDisclosures` 반환 타입에 `avg_price_change: number | null` 추가
- `frontend/src/components/disclosure-card.tsx`
  - 유사 공시 아이템마다 5일 주가 변동률 표시 (초록/빨강)
  - 하단에 "유사 공시 평균 주가 변동 (5일): +X.X%" 요약

---

## 코드 리뷰 후 수정 사항

구현 완료 후 전체 코드 리뷰를 수행하여 다음 이슈를 발견 및 수정:

| 심각도 | 문제 | 수정 |
|--------|------|------|
| CRITICAL | `_corps_cache` 모듈 레벨 import 시 참조 끊김 — `load_cached_corps()`가 새 리스트 재할당하면 다른 모듈의 참조가 stale | `_corps_cache = corps` → `_corps_cache.clear(); _corps_cache.extend(corps)` in-place 변경 |
| CRITICAL | `stock_price.py`의 `datetime.fromisoformat()` 에러 미처리 | try/except 추가 + `cached.data` null 방어 |
| HIGH | `PriceImpactBadge`가 카드마다 마운트 시 API 호출 (N+1) | `visible` prop 추가 → 카드 확장 시에만 로드 |
| HIGH | 네이버 크롤링 동시 요청 무제한 | `asyncio.Semaphore(3)` 추가 |
| HIGH | watchlist `existingCodes` Set 매 렌더마다 재생성 | `useMemo`로 메모이제이션 |
| MEDIUM | 툴팁 모바일 미지원 + segmentText 미캐싱 | onClick 터치 + 외부클릭 닫기 + `useMemo` |
| MEDIUM | briefing 타임존 미고려 | `ZoneInfo("Asia/Seoul")` 적용 |
| MEDIUM | recharts 개별 dynamic import 불안정 | 단일 `stock-chart-inner.tsx` 래퍼로 변경 |
| LOW | "전체 추가" race condition | 순차 실행 (100ms 딜레이) |

---

## 파일 변경 목록

### 신규 생성 (13개)

| 파일 | Phase |
|------|-------|
| `frontend/src/lib/glossary.ts` | 1 |
| `frontend/src/components/glossary-highlight.tsx` | 1 |
| `backend/app/services/popular_stocks.py` | 2 |
| `frontend/src/components/popular-stocks.tsx` | 2 |
| `backend/app/services/sector_mapping.py` | 3 |
| `frontend/src/components/sector-add.tsx` | 3 |
| `backend/app/services/briefing.py` | 4 |
| `backend/app/routers/briefing_api.py` | 4 |
| `frontend/src/components/daily-briefing.tsx` | 4 |
| `backend/app/services/stock_price.py` | 5 |
| `frontend/src/components/stock-price-chart.tsx` | 5 |
| `frontend/src/components/stock-chart-inner.tsx` | 5 |
| `frontend/src/components/price-impact-badge.tsx` | 5 |

### 수정 (11개)

| 파일 | Phase | 변경 내용 |
|------|-------|----------|
| `frontend/src/components/disclosure-card.tsx` | 1, 5, 6 | GlossaryHighlight 적용, PriceImpactBadge 추가, 유사공시 주가변동 표시 |
| `frontend/src/lib/api.ts` | 2, 3, 4, 5, 6 | 6개 타입 + 5개 API 메서드 추가 |
| `backend/app/routers/corp_search_api.py` | 2, 3 | popular, sectors 엔드포인트 |
| `frontend/src/app/watchlist/page.tsx` | 2, 3 | PopularStocks, SectorAdd 컴포넌트 삽입 + useMemo |
| `backend/app/main.py` | 4 | briefing_api 라우터 등록 |
| `frontend/src/app/home-client.tsx` | 4 | DailyBriefing 삽입 |
| `backend/app/routers/financial_api.py` | 5 | stock-price 엔드포인트 |
| `backend/app/routers/disclosure_api.py` | 5, 6 | price-impact 엔드포인트 + similar 응답 강화 |
| `frontend/src/app/company/[corp_code]/page.tsx` | 5 | StockPriceChart 추가 |
| `backend/app/services/analysis_cache.py` | 6 | search_similar_with_impact 함수 |
| `backend/app/services/corp_code_loader.py` | 버그픽스 | _corps_cache in-place 변경 |

---

## 검증 체크리스트

- [x] `cd frontend && npm run build` 성공
- [ ] Phase 1: 공시 카드에서 "유상증자" 등 용어에 마우스 오버 → 툴팁 확인
- [ ] Phase 2: `/api/corps/popular` 응답 확인, 관심종목 페이지에서 인기 종목 표시/추가
- [ ] Phase 3: `/api/corps/sectors` 응답 확인, 업종 선택 → 기업 목록 → 전체 추가
- [ ] Phase 4: `/api/briefing/daily` 응답 확인, 대시보드 상단 브리핑 위젯
- [ ] Phase 5: `/api/company/{code}/stock-price` 주가 데이터, 기업 상세에 차트, 공시 카드에 변동률 배지
- [ ] Phase 6: 유사 공시 섹션에 주가 변동 표시, 평균 변동 요약
