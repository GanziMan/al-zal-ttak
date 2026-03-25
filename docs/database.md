# 알공딱 - 데이터베이스 구조

## 연결 정보

- Supabase PostgreSQL (Transaction Pooler, port 6543)
- SQLAlchemy async + asyncpg
- `statement_cache_size: 0` (pgbouncer 호환)
- 커넥션 풀: `pool_size=5, max_overflow=10`

## 테이블 구조

### users
유저 정보 (카카오 OAuth)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| kakao_id | STRING UNIQUE | 카카오 고유 ID |
| nickname | STRING | 카카오 닉네임 |
| profile_image | STRING | 프로필 이미지 URL |
| created_at | DATETIME | 가입일 |
| last_login | DATETIME | 최근 로그인 |

### watchlist
관심종목 (유저별)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | INTEGER PK, FK→users | 유저 ID |
| corp_code | STRING PK | DART 기업코드 |
| corp_name | STRING | 기업명 |
| stock_code | STRING | 종목코드 |

### bookmarks
공시 북마크 (유저별)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | INTEGER PK, FK→users | 유저 ID |
| rcept_no | STRING PK | 공시 접수번호 |
| corp_name | STRING | 기업명 |
| report_nm | STRING | 공시 제목 |
| memo | STRING | 메모 |
| created_at | DATETIME | 북마크 일시 |

### settings
유저 설정

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | INTEGER PK, FK→users | 유저 ID |
| telegram_enabled | BOOLEAN | 텔레그램 알림 활성화 |
| telegram_chat_id | STRING | 텔레그램 채팅 ID |
| min_importance_score | INTEGER | 최소 중요도 점수 |
| categories | JSON | 표시할 카테고리 목록 |
| alert_categories | JSON | 알림 카테고리 목록 |
| disclosure_days | INTEGER | 공시 조회 기간 |
| alert_keywords | JSON | 키워드 알림 목록 |

### analysis_cache
AI 분석 결과 (전역, 유저 무관)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| rcept_no | STRING PK | 공시 접수번호 |
| rcept_dt | STRING | 접수일 |
| corp_name | STRING | 기업명 |
| report_nm | STRING | 공시 제목 |
| analysis | JSON | AI 분석 결과 |

### corp_codes
DART 기업코드 목록

| 컬럼 | 타입 | 설명 |
|------|------|------|
| corp_code | STRING PK | DART 기업코드 |
| corp_name | STRING | 기업명 |
| stock_code | STRING | 종목코드 |
