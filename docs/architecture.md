# 공시딱 - 시스템 아키텍처

## 개요

DART 공시를 AI가 자동 분석하여 호재/악재를 판별하고, 관심종목 추적 및 알림을 제공하는 서비스.

## 기술 스택

| 계층 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16.2.1 (App Router, React 19) |
| 백엔드 | FastAPI (Python, async) |
| 데이터베이스 | Supabase PostgreSQL (Transaction Pooler) |
| AI 분석 | Google ADK + Gemini 2.5 Flash |
| 인증 | 카카오 OAuth → JWT |
| 호스팅 | Vercel (프론트), Railway (백엔드) |

## 서비스 구조

```
[사용자 브라우저]
    │
    ├── Vercel (Next.js)
    │     프론트엔드, SSG/CSR
    │
    └── Railway (FastAPI)
          ├── DART API (공시 조회)
          ├── Gemini AI (공시 분석)
          ├── Supabase DB (데이터 저장)
          ├── Kakao OAuth (인증)
          └── Telegram Bot (알림)
```

## 데이터 흐름

### 공시 조회 흐름
1. 유저 요청 → 백엔드
2. 메모리 캐시 확인 (5분 TTL)
3. 캐시 미스 → DART API 병렬 호출 (종목별)
4. 응답 캐시 저장 → 유저에게 반환
5. 미분석 공시 → 백그라운드에서 AI 분석 실행

### 인증 흐름
1. 카카오 로그인 버튼 클릭
2. 백엔드 `/api/auth/kakao/login` → 카카오 인증 페이지 리다이렉트
3. 카카오 콜백 → 백엔드에서 토큰 교환 → 유저 정보 조회
4. DB에 유저 생성/업데이트 → JWT 발급
5. 프론트엔드 `/auth/callback`에서 JWT 저장 (localStorage)

### 캐시 워밍업 흐름
1. 서버 시작 5초 후 → 모든 활성 유저의 관심종목 공시를 DART에서 사전 로드
2. 30분마다 auto_scan → 캐시 갱신 + AI 분석 + 텔레그램 알림
3. 유저 접속 시 → 캐시 히트 → 즉시 응답
