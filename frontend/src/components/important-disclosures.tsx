"use client";

import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/lib/api";
import { categoryColor, categoryDot, formatDateShort, scoreColor } from "@/lib/disclosure-utils";
import { cn } from "@/lib/utils";

interface ImportantDisclosuresProps {
  disclosures: Disclosure[];
}

export function ImportantDisclosures({ disclosures }: ImportantDisclosuresProps) {
  if (disclosures.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            High Priority
          </h2>
        </div>
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No high-priority filings detected
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="border-b border-border/50 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          High Priority
        </h2>
      </div>
      <div className="divide-y divide-border/30">
        {disclosures.map((d) => {
          const cat = d.analysis?.category || "단순정보";
          const score = d.analysis?.importance_score ?? 0;
          return (
            <div key={d.rcept_no} className="px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", categoryDot[cat])} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDateShort(d.rcept_dt)}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {d.corp_name}
                    </span>
                  </div>
                  <p className="text-sm truncate text-foreground/80">{d.report_nm}</p>
                  {d.analysis?.action_item && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {d.analysis.action_item}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs font-mono font-bold", scoreColor(score))}>
                    {score}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px]", categoryColor[cat])}>
                    {cat}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RecentTimelineProps {
  disclosures: Disclosure[];
}

export function RecentTimeline({ disclosures }: RecentTimelineProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="border-b border-border/50 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Latest Filings
        </h2>
      </div>
      {disclosures.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Add stocks to your watchlist to see filings here
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {disclosures.map((d) => (
            <div
              key={d.rcept_no}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors"
            >
              <span className="shrink-0 text-[10px] font-mono text-muted-foreground tabular-nums">
                {formatDateShort(d.rcept_dt)}
              </span>
              <span className="text-xs font-semibold text-primary shrink-0">
                {d.corp_name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {d.report_nm}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
