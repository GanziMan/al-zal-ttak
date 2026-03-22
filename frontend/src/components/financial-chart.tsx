"use client";

import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import { FinancialYear } from "@/lib/api";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

function formatBillion(value: number): string {
  if (value === 0) return "0";
  const billion = value / 100000000;
  if (Math.abs(billion) >= 10000) return `${(billion / 10000).toFixed(1)}조`;
  return `${billion.toFixed(0)}억`;
}

function getAccount(accounts: Array<{ account: string; amount: number }>, name: string): number {
  return accounts.find((a) => a.account === name)?.amount ?? 0;
}

interface FinancialChartProps {
  data: FinancialYear[];
}

export function FinancialChart({ data }: FinancialChartProps) {
  const chartData = data
    .filter((d) => d.accounts.length > 0)
    .map((d) => ({
      year: d.year,
      매출액: getAccount(d.accounts, "매출액"),
      영업이익: getAccount(d.accounts, "영업이익"),
      당기순이익: getAccount(d.accounts, "당기순이익"),
    }));

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="border-b border-border/30 px-4 py-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary/60" />
        <h2 className="text-[13px] font-semibold text-foreground/80">재무 추이</h2>
      </div>
      <div className="p-4">
        {chartData.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/50 text-center py-12">
            재무 데이터가 없습니다
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={formatBillion}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
                formatter={(value) => formatBillion(Number(value ?? 0))}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="매출액" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="영업이익" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="당기순이익" fill="#4338ca" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
