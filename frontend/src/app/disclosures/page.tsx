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
      setError("Unable to load disclosures. Check backend server.");
    } finally {
      setLoading(false);
    }
  }, [days, category, minScore]);

  useEffect(() => {
    fetchDisclosures();
  }, [fetchDisclosures]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Disclosures</h1>
          <p className="text-xs text-muted-foreground">
            AI-analyzed filings from your watchlist
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
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : disclosures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 py-16 text-center">
            <p className="text-sm text-muted-foreground">No filings found</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add stocks to your watchlist or adjust filters
            </p>
          </div>
        ) : (
          disclosures.map((d) => (
            <DisclosureCard key={d.rcept_no} disclosure={d} />
          ))
        )}
      </div>

      {!loading && disclosures.length > 0 && (
        <p className="text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {disclosures.length} filing{disclosures.length !== 1 ? "s" : ""} total
        </p>
      )}
    </div>
  );
}
