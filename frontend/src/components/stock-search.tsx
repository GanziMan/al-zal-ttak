"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { api, Corp } from "@/lib/api";

interface StockSearchProps {
  onSelect: (corp: Corp) => void;
}

export function StockSearch({ onSelect }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Corp[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchCorps(query);
        setResults(data.results);
        setOpen(data.results.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Input
        placeholder="Search stocks... (e.g. Samsung)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 bg-card border-border/50 text-sm placeholder:text-muted-foreground/50"
      />
      {loading && (
        <div className="absolute right-3 top-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Searching...
        </div>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-xl overflow-hidden">
          {results.map((corp) => (
            <button
              key={corp.corp_code}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors border-b border-border/20 last:border-0"
              onClick={() => {
                onSelect(corp);
                setQuery("");
                setOpen(false);
              }}
            >
              <span className="font-medium text-foreground">{corp.corp_name}</span>
              <span className="font-mono text-xs text-muted-foreground">{corp.stock_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
