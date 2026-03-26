# 공시딱 - 성능 최적화

## 캐싱 전략

### 백엔드 (DART API 응답 캐시)
- **위치:** 메모리 (서버 프로세스 내)
- **TTL:** 5분
- **키:** `{corp_code}_{start_date}_{end_date}`
- **파일:** `backend/app/services/dart_cache.py`

첫 요청만 DART API를 호출하고, 5분 내 동일 요청은 캐시에서 즉시 반환.

### 백엔드 (캐시 워밍업)
- **시점:** 서버 시작 5초 후
- **동작:** 모든 활성 유저의 관심종목 공시를 미리 DART에서 로드
- **주기:** 30분마다 auto_scan이 캐시를 갱신
- **파일:** `backend/app/main.py` (`_warmup_cache`)

### 프론트엔드 (Stale-While-Revalidate)
- **위치:** localStorage
- **TTL:** 5분 (stale 후에도 즉시 반환, 백그라운드 갱신)
- **적용:** 대시보드, 관심종목, 공시 목록, 히스토리, 북마크
- **파일:** `frontend/src/lib/api.ts` (`fetchWithRevalidate`)

## 병렬 처리

| 대상 | 방식 |
|------|------|
| DART API 종목별 호출 | `asyncio.gather` 병렬 |
| 분석 캐시 조회 | `asyncio.gather` 병렬 |
| AI 분석 (백그라운드) | Semaphore(5) 동시 처리 |
| corp_codes DB 삽입 | 500건씩 batch insert |

## 커넥션 관리

| 리소스 | 설정 |
|--------|------|
| DB 커넥션 풀 | pool_size=5, max_overflow=10 |
| httpx (DART) | 싱글톤 클라이언트 (재사용) |
| pgbouncer 호환 | statement_cache_size=0 |

## 낙관적 업데이트

관심종목 추가/삭제 시 UI를 즉시 반영하고, API 실패 시 롤백.
- **파일:** `frontend/src/app/watchlist/page.tsx`
