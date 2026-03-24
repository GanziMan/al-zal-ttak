"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api, type PriceImpact } from "@/lib/api";

interface PriceImpactBadgeProps {
  rceptNo: string;
  /** true일 때만 API 호출 (lazy load) */
  visible?: boolean;
}

export function PriceImpactBadge({ rceptNo, visible = false }: PriceImpactBadgeProps) {
  const [impact, setImpact] = useState<PriceImpact | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!visible || loaded) return;
    setLoaded(true);
    api.getPriceImpact(rceptNo).then((d) => setImpact(d.impact)).catch(() => {});
  }, [rceptNo, visible, loaded]);

  if (!impact || impact.change_1d === null) return null;

  const change = impact.change_1d;
  const isPositive = change >= 0;

  const details = [
    impact.change_1d !== null ? `1일: ${impact.change_1d > 0 ? "+" : ""}${impact.change_1d}%` : null,
    impact.change_3d !== null ? `3일: ${impact.change_3d > 0 ? "+" : ""}${impact.change_3d}%` : null,
    impact.change_5d !== null ? `5일: ${impact.change_5d > 0 ? "+" : ""}${impact.change_5d}%` : null,
  ].filter(Boolean).join(" | ");

  return (
    <span
      title={details}
      className={
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums " +
        (isPositive
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400")
      }
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
}
