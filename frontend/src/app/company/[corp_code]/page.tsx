"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Building2, Globe, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, fetchWithRevalidate, CompanySummary } from "@/lib/api";
import { FinancialChart } from "@/components/financial-chart";
import { DividendTable } from "@/components/dividend-table";
import { ShareholderTable } from "@/components/shareholder-table";

export default function CompanyDetailPage() {
  const params = useParams();
  const corpCode = params.corp_code as string;
  const [data, setData] = useState<CompanySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!corpCode) return;
    fetchWithRevalidate<CompanySummary>(
      `/api/company/${corpCode}/summary`,
      (fresh) => setData(fresh),
      `company_${corpCode}`,
    )
      .then((cached) => { if (cached) setData(cached); })
      .catch(() => setError("기업 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [corpCode]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">{error || "데이터를 찾을 수 없습니다"}</p>
        <Link href="/watchlist" className="mt-3 inline-block">
          <Button variant="outline" size="sm">관심종목으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const { company, financials, dividends, shareholders } = data;

  return (
    <div className="space-y-6">
      {/* 기업 헤더 */}
      <div className="glass-card rounded-2xl px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {company.corp_name || corpCode}
            </h1>
            {company.corp_name_eng && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {company.corp_name_eng}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
              {company.stock_code && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {company.stock_code}
                </span>
              )}
              {company.ceo_nm && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {company.ceo_nm}
                </span>
              )}
              {company.est_dt && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {company.est_dt.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")} 설립
                </span>
              )}
              {company.hm_url && (
                <a
                  href={company.hm_url.startsWith("http") ? company.hm_url : `https://${company.hm_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  홈페이지
                </a>
              )}
            </div>
          </div>
          <Link href={`/disclosures?corp_code=${corpCode}`}>
            <Button variant="outline" size="sm" className="text-[11px] shrink-0">
              공시 보기
            </Button>
          </Link>
        </div>
      </div>

      {/* 재무 차트 */}
      <FinancialChart data={financials} />

      {/* 배당 + 대주주 */}
      <div className="grid gap-4 md:grid-cols-2">
        <DividendTable data={dividends} />
        <ShareholderTable data={shareholders} />
      </div>
    </div>
  );
}
