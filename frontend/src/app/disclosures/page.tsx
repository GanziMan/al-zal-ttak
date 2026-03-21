"use client";

import { useState, useEffect, useCallback } from "react";
import { DisclosureFilters } from "@/components/disclosure-filters";
import { DisclosureCard } from "@/components/disclosure-card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Disclosure } from "@/lib/api";

export default function DisclosuresPage() {
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [days, setDays] = useState(7);
  const [minScore, setMinScore] = useState(0);

  const fetchDisclosures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDisclosures({
        days,
        category: category === "all" ? undefined : category,
        min_score: minScore || undefined,
      });
      setDisclosures(data.disclosures);
      setError("");
    } catch {
      setError("공시 데이터를 불러올 수 없습니다. 백엔드 서버를 확인하세요.");
    } finally {
      setLoading(false);
    }
  }, [days, category, minScore]);

  useEffect(() => {
    fetchDisclosures();
  }, [fetchDisclosures]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">공시</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            관심종목의 AI 분석 공시
          </p>
        </div>
        <DisclosureFilters
          category={category}
          days={days}
          minScore={minScore}
          onCategoryChange={setCategory}
          onDaysChange={setDays}
          onMinScoreChange={setMinScore}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : disclosures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">공시가 없습니다</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground/60">
              관심종목을 추가하거나 필터를 조정하세요
            </p>
          </div>
        ) : (
          disclosures.map((d) => (
            <DisclosureCard key={d.rcept_no} disclosure={d} />
          ))
        )}
      </div>

      {!loading && disclosures.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/50">
          총 {disclosures.length}건
        </p>
      )}
    </div>
  );
}
