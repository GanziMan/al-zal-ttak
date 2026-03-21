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
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">관심종목이 없습니다</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          위에서 종목을 검색하여 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white card-elevated overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 border-b border-border bg-accent/30 px-4 py-2.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          종목명
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          종목코드
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          기업코드
        </span>
        <span className="text-[11px] font-medium text-muted-foreground text-right">
          관리
        </span>
      </div>
      {/* Rows */}
      {items.map((item) => (
        <div
          key={item.corp_code}
          className="group grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center border-b border-border last:border-0 px-4 py-3 hover:bg-accent/30 transition-colors"
        >
          <span className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
            {item.corp_name}
          </span>
          <span className="text-[11px] text-primary/70">
            {item.stock_code}
          </span>
          <span className="text-[11px] text-muted-foreground/50">
            {item.corp_code}
          </span>
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={() => onRemove(item.corp_code)}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}
      <div className="border-t border-border bg-accent/20 px-4 py-2">
        <span className="text-[11px] text-muted-foreground/50">
          총 {items.length}개 종목
        </span>
      </div>
    </div>
  );
}
