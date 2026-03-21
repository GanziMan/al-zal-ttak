export const categoryColor: Record<string, string> = {
  호재: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  악재: "bg-red-500/15 text-red-400 border-red-500/30",
  중립: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  단순정보: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export const categoryBorder: Record<string, string> = {
  호재: "border-l-emerald-500",
  악재: "border-l-red-500",
  중립: "border-l-amber-500",
  단순정보: "border-l-zinc-600",
};

export const categoryDot: Record<string, string> = {
  호재: "bg-emerald-400",
  악재: "bg-red-400",
  중립: "bg-amber-400",
  단순정보: "bg-zinc-500",
};

export function formatDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
}

export function formatDateShort(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
}

export function scoreColor(score: number) {
  if (score >= 80) return "text-red-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 20) return "text-blue-400";
  return "text-zinc-500";
}
