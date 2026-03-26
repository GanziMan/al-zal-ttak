"use client";

import Link from "next/link";
import { Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { WatchlistItem } from "@/lib/api";

interface WatchlistTableProps {
  items: WatchlistItem[];
  onRemove: (corpCode: string) => void;
}

export function WatchlistTable({ items, onRemove }: WatchlistTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="관심종목이 없습니다"
        description="위에서 종목을 검색하여 추가하세요"
      />
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <div
            key={item.corp_code}
            className="glass-card rounded-2xl p-4 flex items-center justify-between"
          >
            <Link
              href={`/company/${item.corp_code}`}
              className="min-w-0 flex-1"
            >
              <p className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors">
                {item.corp_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-primary/70">{item.stock_code}</span>
                <span className="text-[10px] text-muted-foreground/50">{item.corp_code}</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
              onClick={() => onRemove(item.corp_code)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <p className="text-center text-[11px] text-muted-foreground/50 pt-1">
          총 {items.length}개 종목
        </p>
      </div>

      {/* Desktop: grid table */}
      <div className="hidden sm:block glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 border-b border-border/30 bg-accent/30 px-4 py-2.5">
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
            className="group grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center border-b border-border/30 last:border-0 px-4 py-3 hover:bg-accent/30 transition-colors"
          >
            <Link
              href={`/company/${item.corp_code}`}
              className="text-[13px] font-semibold text-foreground group-hover:text-primary hover:underline transition-colors"
            >
              {item.corp_name}
            </Link>
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
                className="h-7 w-7 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={() => onRemove(item.corp_code)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <div className="border-t border-border/30 bg-accent/20 px-4 py-2">
          <span className="text-[11px] text-muted-foreground/50">
            총 {items.length}개 종목
          </span>
        </div>
      </div>
    </>
  );
}
