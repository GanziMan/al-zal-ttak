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
    {
      label: "관심종목",
      value: watchlistCount,
      sub: "추적 중인 종목",
      color: "text-primary",
      border: "border-border",
    },
    {
      label: "오늘",
      value: todayDisclosures,
      sub: "신규 공시",
      color: "text-foreground",
      border: "border-border",
    },
    {
      label: "호재",
      value: bullish,
      sub: "긍정 시그널",
      color: "text-emerald-600",
      border: "border-emerald-200",
    },
    {
      label: "악재",
      value: bearish,
      sub: "위험 알림",
      color: "text-red-600",
      border: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border ${card.border} bg-white card-elevated p-4 transition-all hover:shadow-md`}
        >
          <p className="text-[11px] font-medium text-muted-foreground">
            {card.label}
          </p>
          <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${card.color}`}>
            {card.value}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
