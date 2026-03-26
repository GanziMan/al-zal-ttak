import { NextResponse } from "next/server";

const SITE_URL = "https://gongsittak.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRFC822(dateStr: string): string {
  // YYYYMMDDHHMMSS → RFC 822
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10) || "00";
  const minute = dateStr.slice(10, 12) || "00";
  const second = dateStr.slice(12, 14) || "00";

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`);
  return date.toUTCString();
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/disclosures/public?days=7`, {
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disclosures");
    }

    const data = await res.json();
    const disclosures = data.disclosures?.slice(0, 50) || [];

    const items = disclosures
      .map((d: any) => {
        const title = `[${escapeXml(d.corp_name || "")}] ${escapeXml(d.report_nm || "")}`;
        const link = `${SITE_URL}/disclosures`;
        const pubDate = d.rcept_dt ? formatRFC822(d.rcept_dt) : new Date().toUTCString();
        const guid = d.rcept_no || "";

        let description = "";
        if (d.analysis) {
          const category = d.analysis.category || "";
          const score = d.analysis.importance_score || 0;
          const summary = d.analysis.summary || "";

          const categoryEmoji = category === "호재" ? "📈" : category === "악재" ? "📉" : "📄";
          description = `${categoryEmoji} ${category} (중요도: ${score}/10)`;
          if (summary) {
            description += `\n\n${escapeXml(summary)}`;
          }
        } else {
          description = "분석 대기 중";
        }

        return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
    </item>`;
      })
      .join("\n");

    const now = new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>공시딱 - AI 공시 분석</title>
    <link>${SITE_URL}</link>
    <description>DART 공시를 AI가 자동으로 분석하고 호재/악재를 판별해드립니다</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <ttl>5</ttl>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("RSS feed error:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
