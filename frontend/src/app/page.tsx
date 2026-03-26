import { HomeClient } from "./home-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DisclosureAnalysis {
  category: string;
  importance_score: number;
  summary: string;
  action_item: string;
}

interface Disclosure {
  rcept_no: string;
  rcept_dt: string;
  corp_name: string;
  corp_code: string;
  report_nm: string;
  flr_nm: string;
  _watchlist_name: string;
  analysis: DisclosureAnalysis | null;
}

interface DashboardSummary {
  watchlist_count: number;
  today_disclosures: number;
  bullish: number;
  bearish: number;
  important_disclosures: Disclosure[];
  recent_disclosures: Disclosure[];
}

interface PublicDisclosuresResponse {
  disclosures: Disclosure[];
}

// 랜딩은 ISR로 미리 생성해 초기 로딩 지연을 줄임
export const revalidate = 300;

export default async function HomePage() {
  let summary: DashboardSummary | null = null;
  let disclosures: Disclosure[] = [];

  try {
    const [summaryRes, disclosuresRes] = await Promise.all([
      fetch(`${API_BASE}/api/dashboard/public`, {
        next: { revalidate },
      }),
      fetch(`${API_BASE}/api/disclosures/public?days=7`, {
        next: { revalidate },
      }),
    ]);

    if (summaryRes.ok) {
      summary = await summaryRes.json();
    }

    if (disclosuresRes.ok) {
      const data: PublicDisclosuresResponse = await disclosuresRes.json();
      disclosures = data.disclosures.slice(0, 10);
    }
  } catch {
    // 백엔드 응답 실패 시 클라이언트 폴백 fetch 사용
  }

  return <HomeClient summary={summary} disclosures={disclosures} />;
}
