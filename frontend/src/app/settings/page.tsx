"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LogOut, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, getCached, setCache, isFresh, AppSettings } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const ALL_CATEGORIES = ["호재", "악재", "중립", "단순정보"];

export default function SettingsPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(() => getCached<AppSettings>("/api/settings"));
  const [loading, setLoading] = useState(() => !getCached("/api/settings"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings && isFresh("/api/settings")) {
      setLoading(false);
      return;
    }
    async function fetchSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
        setCache("/api/settings", data);
      } catch {
        if (!settings) setError("설정을 불러올 수 없습니다. 백엔드 서버를 확인하세요.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      toast.success("설정이 저장되었습니다");
    } catch {
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: string) {
    if (!settings) return;
    const cats = settings.alert_categories.includes(cat)
      ? settings.alert_categories.filter((c) => c !== cat)
      : [...settings.alert_categories, cat];
    setSettings({ ...settings, alert_categories: cats });
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            알림 및 필터를 설정하세요
          </p>
        </div>
        {/* Loading skeleton */}
        <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
          <div className="border-b border-border/30 px-4 py-3 h-10 bg-muted/20" />
          <div className="p-4 space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-16 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-9 w-40 bg-muted rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-9 w-40 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
        <div className="h-9 w-24 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          알림 및 필터를 설정하세요
        </p>
      </div>

      {/* Alert Filters Section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="border-b border-border/30 px-4 py-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary/60" />
          <h2 className="text-[12px] font-semibold text-muted-foreground">
            알림 필터
          </h2>
        </div>
        <div className="p-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-[11px] text-muted-foreground">알림 카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = settings.alert_categories.includes(cat);
                return (
                  <Badge
                    key={cat}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all text-[11px] rounded-lg",
                      active
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                        : "text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground"
                    )}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">최소 중요도 점수</Label>
            <Select
              value={String(settings.min_importance_score)}
              onValueChange={(v) =>
                v && setSettings({ ...settings, min_importance_score: Number(v) })
              }
            >
              <SelectTrigger className="h-9 w-[160px] text-sm bg-card border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">전체 (0+)</SelectItem>
                <SelectItem value="20">20점 이상</SelectItem>
                <SelectItem value="30">30점 이상</SelectItem>
                <SelectItem value="50">50점 이상</SelectItem>
                <SelectItem value="80">80점 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">공시 조회 기간</Label>
            <Select
              value={String(settings.disclosure_days)}
              onValueChange={(v) =>
                v && setSettings({ ...settings, disclosure_days: Number(v) })
              }
            >
              <SelectTrigger className="h-9 w-[160px] text-sm bg-card border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1일</SelectItem>
                <SelectItem value="3">3일</SelectItem>
                <SelectItem value="7">7일</SelectItem>
                <SelectItem value="14">14일</SelectItem>
                <SelectItem value="30">30일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 w-full sm:w-auto text-[12px] rounded-xl"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>

      {/* Account Section */}
      {isLoggedIn && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="border-b border-border/30 px-4 py-3 flex items-center gap-2">
            <LogOut className="h-4 w-4 text-primary/60" />
            <h2 className="text-[12px] font-semibold text-muted-foreground">
              계정
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">{user?.nickname}</p>
              <p className="text-[11px] text-muted-foreground">카카오 로그인</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-8 text-[12px] rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
