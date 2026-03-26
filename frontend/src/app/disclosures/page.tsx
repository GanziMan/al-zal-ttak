import { DisclosuresClient } from "./disclosures-client";
import type { Disclosure } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const revalidate = 300;

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
