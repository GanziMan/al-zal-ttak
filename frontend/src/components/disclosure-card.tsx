"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/lib/api";
import { categoryColor, categoryBorder, categoryDot, formatDate, scoreColor } from "@/lib/disclosure-utils";
import { cn } from "@/lib/utils";

interface DisclosureCardProps {
  disclosure: Disclosure;
}

export function DisclosureCard({ disclosure }: DisclosureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const analysis = disclosure.analysis;
  const cat = analysis?.category || "단순정보";
  const score = analysis?.importance_score ?? 0;

  return (
    <article
      className={cn(
        "rounded-lg border border-border/50 bg-card border-l-[3px] transition-all hover:bg-accent/20",
        categoryBorder[cat] || "border-l-zinc-600"
      )}
    >
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", categoryDot[cat])} />
              <span className="text-xs font-semibold text-foreground">
                {disclosure.corp_name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {formatDate(disclosure.rcept_dt)}
              </span>
            </div>
            <h3 className="text-sm font-medium leading-snug text-foreground/90">
              {disclosure.report_nm}
            </h3>
          </div>
          {analysis && (
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant="outline" className={cn("text-[10px] font-medium", categoryColor[cat])}>
                {cat}
              </Badge>
              <span className={cn("text-lg font-mono font-bold tabular-nums", scoreColor(score))}>
                {score}
              </span>
            </div>
          )}
        </div>

        {/* Action item */}
        {analysis && (
          <div className="mt-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {analysis.action_item}
            </p>

            {/* Expandable AI summary */}
            {expanded && (
              <div className="mt-3 rounded border border-border/50 bg-muted/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  AI Analysis
                </p>
                <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {analysis.summary}
                </p>
              </div>
            )}

            <button
              className="mt-2 text-[10px] font-medium uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Collapse" : "View Analysis"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
