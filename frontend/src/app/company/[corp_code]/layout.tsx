import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  params: Promise<{ corp_code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { corp_code } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/company/${corp_code}/summary`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { title: "기업 정보" };

    const data = await res.json();
    const name = data.company?.corp_name ?? corp_code;

    return {
      title: `${name} - 기업분석`,
      description: `${name}의 재무제표, 배당, 대주주 현황을 확인하세요.`,
      openGraph: {
        title: `${name} 기업분석 | 알잘딱`,
        description: `${name}의 재무제표, 배당, 대주주 현황`,
      },
    };
  } catch {
    return { title: "기업 정보" };
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
