"use client";

import { Button } from "@/components/ui/button";
import { WatchlistItem } from "@/lib/api";

interface WatchlistTableProps {
  items: WatchlistItem[];
  onRemove: (corpCode: string) => void;
}

export function WatchlistTable({ items, onRemove }: WatchlistTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 py-16 text-center">
        <p className="text-sm text-muted-foreground">No stocks in watchlist</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Search above to add stocks
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 border-b border-border/50 bg-muted/30 px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Name
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ticker
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Corp Code
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
          Action
        </span>
      </div>
      {/* Rows */}
      {items.map((item) => (
        <div
          key={item.corp_code}
          className="grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center border-b border-border/20 last:border-0 px-4 py-3 hover:bg-accent/20 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground">
            {item.corp_name}
          </span>
          <span className="font-mono text-xs text-primary">
            {item.stock_code}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {item.corp_code}
          </span>
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(item.corp_code)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <div className="border-t border-border/50 bg-muted/20 px-4 py-2">
        <span className="text-[10px] font-mono text-muted-foreground">
          {items.length} stock{items.length !== 1 ? "s" : ""} tracked
        </span>
      </div>
    </div>
  );
}
