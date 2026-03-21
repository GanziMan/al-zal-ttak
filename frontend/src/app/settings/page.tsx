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
const CATEGORY_EN: Record<string, string> = {
  호재: "Bullish",
  악재: "Bearish",
  중립: "Neutral",
  단순정보: "Info",
};

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
        setError("Unable to load settings. Check backend server.");
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
      setError("Failed to save settings.");
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
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Configure notifications and filters
        </p>
      </div>

      {/* Telegram Section */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Telegram Notifications
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="telegram-toggle" className="text-sm">Enable notifications</Label>
            <Switch
              id="telegram-toggle"
              checked={settings.telegram_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, telegram_enabled: checked })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chat-id" className="text-xs text-muted-foreground">Chat ID</Label>
            <Input
              id="chat-id"
              value={settings.telegram_chat_id}
              onChange={(e) =>
                setSettings({ ...settings, telegram_chat_id: e.target.value })
              }
              placeholder="Enter Telegram Chat ID"
              className="h-9 bg-muted/30 border-border/50 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Alert Filters Section */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="border-b border-border/50 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Alert Filters
          </h2>
        </div>
        <div className="p-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Alert categories</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = settings.alert_categories.includes(cat);
                return (
                  <Badge
                    key={cat}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors text-xs",
                      active
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "text-muted-foreground border-border/50 hover:border-border"
                    )}
                    onClick={() => toggleCategory(cat)}
                  >
                    {CATEGORY_EN[cat]} ({cat})
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Minimum importance score</Label>
            <Select
              value={String(settings.min_importance_score)}
              onValueChange={(v) =>
                v && setSettings({ ...settings, min_importance_score: Number(v) })
              }
            >
              <SelectTrigger className="h-9 w-[160px] text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All (0+)</SelectItem>
                <SelectItem value="20">Score 20+</SelectItem>
                <SelectItem value="30">Score 30+</SelectItem>
                <SelectItem value="50">Score 50+</SelectItem>
                <SelectItem value="80">Score 80+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Disclosure lookback period</Label>
            <Select
              value={String(settings.disclosure_days)}
              onValueChange={(v) =>
                v && setSettings({ ...settings, disclosure_days: Number(v) })
              }
            >
              <SelectTrigger className="h-9 w-[160px] text-sm bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 text-xs uppercase tracking-wider"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-400">Saved successfully</span>
        )}
      </div>
    </div>
  );
}
