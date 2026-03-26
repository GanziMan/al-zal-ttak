import type { Metadata } from "next";
import { DisclosuresClient } from "./disclosures-client";
import type { Disclosure } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ corp_name?: string }>;
}): Promise<Metadata> {
  const { corp_name } = await searchParams;
  if (corp_name) {
    return {
      title: `${corp_name} 공시 - 공시딱`,
      description: `${corp_name}의 최신 공시를 AI가 분석한 결과를 확인하세요.`,
    };
  }
  return {
    title: "공시딱 | 공시 피드",
    description:
      "상장기업의 최신 공시(기업 공개 보고서)를 AI가 분석한 결과를 확인하세요. 호재/악재 분류, 중요도 점수, 핵심 요약을 제공합니다.",
  };
}

export default async function DisclosuresPage() {
  let initialDisclosures: Disclosure[] = [];

  try {
    const res = await fetch(`${API_BASE}/api/disclosures/public?days=30`, {
      next: { revalidate },
    });
    if (res.ok) {
      const data: { disclosures: Disclosure[] } = await res.json();
      initialDisclosures = data.disclosures;
    }
  } catch {
    // 네트워크 실패 시 클라이언트 폴백 사용
  }

  return <DisclosuresClient initialDisclosures={initialDisclosures} />;
}
