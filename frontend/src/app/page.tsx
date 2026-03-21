"use client";

import { useState, useEffect } from "react";
import { SummaryCards } from "@/components/summary-cards";
import {
  ImportantDisclosures,
  RecentTimeline,
} from "@/components/important-disclosures";
import { Skeleton } from "@/components/ui/skeleton";
import { api, DashboardSummary } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const summary = await api.getDashboardSummary();
        setData(summary);
      } catch {
        setError("Unable to load dashboard data. Check backend server.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Market disclosure overview</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Market disclosure overview</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <SummaryCards
        watchlistCount={data?.watchlist_count ?? 0}
        todayDisclosures={data?.today_disclosures ?? 0}
        bullish={data?.bullish ?? 0}
        bearish={data?.bearish ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ImportantDisclosures
          disclosures={data?.important_disclosures ?? []}
        />
        <RecentTimeline disclosures={data?.recent_disclosures ?? []} />
      </div>
    </div>
  );
}
