"use client";

import { useState, useEffect, useCallback } from "react";
import { StockSearch } from "@/components/stock-search";
import { WatchlistTable } from "@/components/watchlist-table";
import { api, Corp, WatchlistItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWatchlist = useCallback(async () => {
    try {
      const data = await api.getWatchlist();
      setWatchlist(data.watchlist);
      setError("");
    } catch {
      setError("관심종목을 불러올 수 없습니다. 백엔드 서버를 확인하세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  async function handleAdd(corp: Corp) {
    try {
      const data = await api.addToWatchlist({
        corp_code: corp.corp_code,
        corp_name: corp.corp_name,
        stock_code: corp.stock_code,
      });
      setWatchlist(data.watchlist);
    } catch {
      setError("종목 추가에 실패했습니다.");
    }
  }

  async function handleRemove(corpCode: string) {
    try {
      const data = await api.removeFromWatchlist(corpCode);
      setWatchlist(data.watchlist);
    } catch {
      setError("종목 삭제에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">관심종목</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          관심 종목을 관리하세요
        </p>
      </div>

      <StockSearch onSelect={handleAdd} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-52 rounded-xl" />
      ) : (
        <WatchlistTable items={watchlist} onRemove={handleRemove} />
      )}
    </div>
  );
}
