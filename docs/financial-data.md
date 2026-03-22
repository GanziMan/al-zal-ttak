# 알잘딱 - 기업 재무 데이터

## 개요

관심종목별 재무제표, 배당, 대주주 현황을 DART Open API에서 가져와 표시합니다.

## DART API 엔드포인트

| API | 엔드포인트 | 설명 |
|-----|-----------|------|
| 재무제표 | `fnlttSinglAcnt.json` | 단일회사 주요계정 (매출, 영업이익, 순이익 등) |
| 배당 | `alotMatter.json` | 배당에 관한 사항 (주당배당금, 배당수익률 등) |
| 대주주 | `hyslrSttus.json` | 최대주주 현황 (성명, 지분율 등) |

### 공통 파라미터
- `crtfc_key`: DART API 키
- `corp_code`: 기업 고유코드 (8자리)
- `bsns_year`: 사업연도 (예: "2024")
- `reprt_code`: 보고서 코드
  - `11013`: 1분기
  - `11012`: 반기
  - `11014`: 3분기
  - `11011`: 사업보고서 (연간)

## 데이터 흐름

```
프론트엔드 → /api/company/{corp_code}/summary
          → 백엔드 Service
          → DB 캐시 확인 (24시간 TTL)
          → 캐시 미스 시 DART API 호출
          → 응답 파싱 → DB 저장 → 반환
```

## 캐싱 전략

- **DB 캐시**: `financial_data` 테이블 (JSON 컬럼)
- **TTL**: 24시간 (재무 데이터는 분기별 변경)
- **캐시 키**: corp_code + data_type + bsns_year + reprt_code (복합 PK)

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/company/{corp_code}/summary` | 통합 조회 (기업정보+재무+배당+대주주) |
| GET | `/api/company/{corp_code}/financials` | 재무제표만 |
| GET | `/api/company/{corp_code}/dividends` | 배당만 |
| GET | `/api/company/{corp_code}/shareholders` | 대주주만 |

### /summary 응답 구조

```json
{
  "company": {
    "corp_name": "삼성전자",
    "stock_code": "005930",
    "ceo_nm": "한종희",
    "hm_url": "www.samsung.com"
  },
  "financials": [
    {
      "year": "2023",
      "accounts": [
        { "account": "매출액", "amount": 258935462000000 },
        { "account": "영업이익", "amount": 6566977000000 }
      ]
    }
  ],
  "dividends": [...],
  "shareholders": [
    { "name": "국민연금공단", "ownership_pct": "10.15" }
  ]
}
```

## 프론트엔드

- **기업 상세 페이지**: `/company/{corp_code}`
- **재무 차트**: Recharts BarChart (매출/영업이익/순이익 5년 추이)
- **배당 테이블**: 연도별 주당배당금, 배당수익률, 배당성향
- **대주주 테이블**: 성명, 관계, 보유주식수, 지분율

### 진입점
- 관심종목 페이지에서 종목명 클릭 → `/company/{corp_code}`
