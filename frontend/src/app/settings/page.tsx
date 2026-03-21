"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, AppSettings } from "@/lib/api";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = ["호재", "악재", "중립", "단순정보"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch {
        setError("설정을 불러올 수 없습니다. 백엔드 서버를 확인하세요.");
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("설정 저장에 실패했습니다.");
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
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">설정</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight">설정</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          알림 및 필터를 설정하세요
        </p>
      </div>

      {/* Telegram Section */}
      <div className="rounded-xl border border-border bg-white card-elevated overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2">
          <span className="text-sm">✈</span>
          <h2 className="text-[12px] font-semibold text-muted-foreground">
            텔레그램 알림
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="telegram-toggle" className="text-[13px]">알림 활성화</Label>
            <Switch
              id="telegram-toggle"
              checked={settings.telegram_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, telegram_enabled: checked })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chat-id" className="text-[11px] text-muted-foreground">채팅 ID</Label>
            <Input
              id="chat-id"
              value={settings.telegram_chat_id}
              onChange={(e) =>
                setSettings({ ...settings, telegram_chat_id: e.target.value })
              }
              placeholder="텔레그램 채팅 ID를 입력하세요"
              className="h-9 bg-white border-border text-sm rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Alert Filters Section */}
      <div className="rounded-xl border border-border bg-white card-elevated overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2">
          <span className="text-sm">◈</span>
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
              <SelectTrigger className="h-9 w-[160px] text-sm bg-white border-border rounded-lg">
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
              <SelectTrigger className="h-9 w-[160px] text-sm bg-white border-border rounded-lg">
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 text-[12px] rounded-lg"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
        {saved && (
          <span className="text-[12px] text-emerald-600 font-medium">저장 완료</span>
        )}
      </div>
    </div>
  );
}
