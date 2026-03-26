import { DisclosuresClient } from "./disclosures-client";

// 완전 클라이언트 사이드 렌더링으로 전환 - 즉시 페이지 표시
export default function DisclosuresPage() {
  return <DisclosuresClient initialDisclosures={[]} />;
}
