"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { api, type StockPriceDay } from "@/lib/api";

const StockChart = dynamic(() => import("@/components/stock-chart-inner"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted" />,
});

interface StockPriceChartProps {
  corpCode: string;
}

export function StockPriceChart({ corpCode }: StockPriceChartProps) {
  const [prices, setPrices] = useState<StockPriceDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStockPrices(corpCode, 30)
      .then((d) => setPrices(d.prices.slice().reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [corpCode]);

  if (loading) {
    return <div className="glass-card rounded-2xl h-52 animate-pulse" />;
  }

  if (prices.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl px-4 py-3.5">
      <h3 className="text-[13px] font-semibold mb-3">30일 주가 추이</h3>
      <StockChart prices={prices} />
    </div>
  );
}
