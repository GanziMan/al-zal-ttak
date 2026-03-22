# 알잘딱 - API 문서

## Base URL

- 로컬: `http://localhost:8000`
- 프로덕션: Railway 배포 URL

## 인증

JWT Bearer 토큰. 대부분의 엔드포인트에 필요.

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 인증 API (`/api/auth`)

### GET /api/auth/kakao/login
카카오 로그인 페이지로 리다이렉트.

### GET /api/auth/kakao/callback?code=...
카카오 인증 코드를 JWT로 교환. 프론트엔드 콜백 페이지로 리다이렉트.

### GET /api/auth/me
현재 로그인한 유저 정보 반환.

**응답:**
```json
{ "id": 1, "nickname": "홍길동", "profile_image": "https://..." }
```

---

## 기업 검색 API (`/api/corps`)

### GET /api/corps/search?q=삼성
기업명으로 검색 (DB 기반).

**응답:**
```json
{
  "results": [
    { "corp_code": "00126380", "corp_name": "삼성전자", "stock_code": "005930" }
  ]
}
```

---

## 관심종목 API (`/api/watchlist`)

### GET /api/watchlist
관심종목 목록 조회.

### POST /api/watchlist
관심종목 추가. Body: `{ "corp_code", "corp_name", "stock_code" }`

### DELETE /api/watchlist/{corp_code}
관심종목 삭제.

---

## 공시 API (`/api/disclosures`)

### GET /api/disclosures?days=7&category=호재&min_score=50
관심종목의 공시 목록 + AI 분석 결과.

**응답:**
```json
{
  "disclosures": [
    {
      "rcept_no": "20260322000123",
      "rcept_dt": "20260322",
      "corp_name": "삼성전자",
      "report_nm": "주요사항보고서(자기주식취득결정)",
      "analysis": {
        "category": "호재",
        "importance_score": 75,
        "summary": "삼성전자가 자기주식 1000억원 규모 취득을 결정했습니다.",
        "action_item": "주가 지지 효과 기대, 매수 검토"
      }
    }
  ],
  "total": 15,
  "pending_analysis": 3
}
```

### GET /api/disclosures/count?since=20260322
특정 날짜 이후 공시 건수.

### GET /api/disclosures/{rcept_no}/similar?limit=5
유사 공시 검색.

---

## 대시보드 API (`/api/dashboard`)

### GET /api/dashboard/summary
대시보드 요약 (관심종목 수, 공시 수, 호재/악재, 중요 공시).

### GET /api/dashboard/history?days=14
기간별 공시 추이 (날짜별 건수, 평균 점수, 호재/악재 수).

---

## 북마크 API (`/api/bookmarks`)

### GET /api/bookmarks
북마크 목록.

### POST /api/bookmarks
북마크 추가. Body: `{ "rcept_no", "corp_name", "report_nm", "memo?" }`

### DELETE /api/bookmarks/{rcept_no}
북마크 삭제.

### PATCH /api/bookmarks/{rcept_no}/memo
메모 수정. Body: `{ "memo" }`

---

## 설정 API (`/api/settings`)

### GET /api/settings
유저 설정 조회.

### PUT /api/settings
유저 설정 업데이트. Body: 설정 객체.
