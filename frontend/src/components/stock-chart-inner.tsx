"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StockPriceDay } from "@/lib/api";

interface StockChartInnerProps {
  prices: StockPriceDay[];
}

export default function StockChartInner({ prices }: StockChartInnerProps) {
  console.log("📊 Stock chart data:", prices);
  console.log("📊 Sample data point:", prices[0]);
  console.log("📊 Close value type:", typeof prices[0]?.close);
  console.log("📊 Data length:", prices.length);

  if (!prices || prices.length === 0) {
    return (
      <div className="h-48 w-full flex items-center justify-center text-sm text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  // Ensure close values are numbers (handle potential string serialization)
  const chartData = prices.map((p) => ({
    date: p.date,
    close: Number(p.close),
    open: Number(p.open),
    high: Number(p.high),
    low: Number(p.low),
  }));

  // Calculate domain manually with padding
  const closeValues = chartData.map(d => d.close);
  const minClose = Math.min(...closeValues);
  const maxClose = Math.max(...closeValues);
  const padding = (maxClose - minClose) * 0.1 || 100;

  console.log("📊 Chart data processed:", chartData.slice(0, 3));
  console.log("📊 Y-axis range:", minClose, "to", maxClose);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={[minClose - padding, maxClose + padding]}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
            formatter={(value) => [Number(value).toLocaleString() + "원", "종가"]}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#6366f1"
            strokeWidth={2}
            dot={true}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
