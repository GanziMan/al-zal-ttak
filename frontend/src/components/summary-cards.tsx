"use client";

interface SummaryCardsProps {
  watchlistCount: number;
  todayDisclosures: number;
  bullish: number;
  bearish: number;
}

export function SummaryCards({
  watchlistCount,
  todayDisclosures,
  bullish,
  bearish,
}: SummaryCardsProps) {
  const cards = [
    { label: "WATCHLIST", value: watchlistCount, sub: "stocks", color: "text-primary" },
    { label: "TODAY", value: todayDisclosures, sub: "filings", color: "text-foreground" },
    { label: "BULLISH", value: bullish, sub: "filings", color: "text-emerald-400" },
    { label: "BEARISH", value: bearish, sub: "filings", color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border/50 bg-card p-4"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {card.label}
          </p>
          <p className={`mt-1 text-3xl font-bold font-mono tabular-nums ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
