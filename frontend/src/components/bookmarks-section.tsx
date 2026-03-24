"use client";

import { useState, useEffect, useRef } from "react";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { api, fetchWithRevalidate, Bookmark as BookmarkType } from "@/lib/api";

export function BookmarksSection() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingOps = useRef(0);

  useEffect(() => {
    fetchWithRevalidate<{ bookmarks: BookmarkType[] }>(
      "/api/bookmarks",
      (fresh) => { if (pendingOps.current === 0) setBookmarks(fresh.bookmarks); },
    )
      .then((cached) => { if (cached) setBookmarks(cached.bookmarks); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openDisclosure(corpName: string, reportNm: string) {
    const query = encodeURIComponent(`${corpName} ${reportNm} DART 공시`);
    window.open(`https://search.naver.com/search.naver?query=${query}`, "_blank");
  }

  async function handleRemove(rceptNo: string) {
    setBookmarks((prev) => prev.filter((b) => b.rcept_no !== rceptNo));
    pendingOps.current++;
    try {
      const res = await api.removeBookmark(rceptNo);
      pendingOps.current--;
      if (pendingOps.current === 0) setBookmarks(res.bookmarks);
    } catch {
      pendingOps.current--;
      setBookmarks((prev) => prev);
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="border-b border-border/30 px-4 py-3 flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-primary/60" />
        <h2 className="text-[13px] font-semibold text-foreground/80">북마크</h2>
        {bookmarks.length > 0 && (
          <span className="text-[10px] text-muted-foreground/60 tabular-nums">{bookmarks.length}</span>
        )}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/50 text-center py-4">
            공시 카드에서 북마크를 추가해 보세요
          </p>
        ) : (
          <div className="space-y-2.5">
            {bookmarks.slice(0, 5).map((b) => (
              <div key={b.rcept_no} className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-foreground block">
                    {b.corp_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDisclosure(b.corp_name, b.report_nm)}
                    className="text-[11px] text-foreground/70 hover:text-primary transition-colors line-clamp-1 inline-flex items-center gap-1 text-left"
                  >
                    {b.report_nm}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                  </button>
                  {b.memo && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                      {b.memo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(b.rcept_no)}
                  className="p-1 rounded-md hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
