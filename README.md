# 알공딱 (ALZALTTAK)

AI 기반 한국 주식시장 DART 공시 분석 서비스

## 실행 방법

### 사전 준비

- **Backend**: Docker (또는 Python 3.12+)
- **Frontend**: Node.js 18+

### 환경 변수 설정

```bash
cp backend/.env.example backend/.env
```

`backend/.env` 파일을 열고 API 키를 입력합니다:

```
DART_API_KEY=your_dart_api_key_here
LLM_API_KEY=your_google_gemini_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here   # 선택
```

- `DART_API_KEY` — [DART OpenAPI](https://opendart.fss.or.kr/)에서 발급
- `LLM_API_KEY` — [Google AI Studio](https://aistudio.google.com/)에서 발급
- `TELEGRAM_BOT_TOKEN` — 텔레그램 알림 사용 시에만 필요

### Backend (Docker)

```bash
docker compose up -d --build
```

서버가 `http://localhost:8000`에서 실행됩니다.

API 문서: `http://localhost:8000/docs`

로그 확인:

```bash
docker compose logs -f backend
```

종료:

```bash
docker compose down
```

<details>
<summary>Docker 없이 직접 실행</summary>

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

</details>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

기본적으로 `http://localhost:8000`의 백엔드에 연결됩니다. 백엔드 주소를 변경하려면 `frontend/.env.local` 파일을 생성합니다:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
