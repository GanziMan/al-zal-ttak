# 공시딱 - 배포 가이드

## 프론트엔드 (Vercel)

### 환경변수
| 변수 | 값 |
|------|------|
| `NEXT_PUBLIC_API_URL` | Railway 배포 URL |

### 배포
GitHub push 시 Vercel에서 자동 빌드/배포.

---

## 백엔드 (Railway)

### 환경변수
| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) |
| `DART_API_KEY` | DART OpenAPI 키 |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 클라이언트 시크릿 |
| `KAKAO_REDIRECT_URI` | `https://<railway-url>/api/auth/kakao/callback` |
| `JWT_SECRET` | JWT 서명 비밀키 (32자 이상 랜덤) |
| `FRONTEND_URL` | `https://al-gong-ttak.vercel.app` |
| `TELEGRAM_BOT_TOKEN` | (선택) 텔레그램 봇 토큰 |
| `TELEGRAM_CHAT_ID` | (선택) 텔레그램 채팅 ID |
| `GOOGLE_API_KEY` | Gemini API 키 |

### Dockerfile
- `PORT` 환경변수 사용: `${PORT:-8000}`
- Railway가 포트를 자동 할당

### Supabase 연결 주의사항
- Railway는 IPv4만 지원 → **Transaction Pooler** 사용 필수 (port 6543)
- 비밀번호에 특수문자(`!`, `@`) → URL 인코딩 필요 (`%21`, `%40`)
- pgbouncer 호환: `statement_cache_size=0`, `prepared_statement_cache_size=0`

---

## 카카오 OAuth 설정

1. [Kakao Developers](https://developers.kakao.com) → 앱 생성
2. **플랫폼** → Web → `https://al-gong-ttak.vercel.app` 등록
3. **카카오 로그인** 활성화
4. **Redirect URI**: `https://<railway-url>/api/auth/kakao/callback`
5. **동의 항목**: 닉네임, 프로필 사진 설정
6. **REST API 키**를 `KAKAO_CLIENT_ID`로 사용
7. **보안** → 클라이언트 시크릿 발급 및 활성화

---

## Google Analytics

측정 ID `G-ZY0B7D53G0`가 `layout.tsx`에 직접 삽입되어 있음.
변경 시 `frontend/src/app/layout.tsx`에서 수정.
