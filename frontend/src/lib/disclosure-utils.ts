export const categoryColor: Record<string, string> = {
  호재: "bg-emerald-50 text-emerald-700 border-emerald-200",
  악재: "bg-red-50 text-red-700 border-red-200",
  중립: "bg-amber-50 text-amber-700 border-amber-200",
  단순정보: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export const categoryBorder: Record<string, string> = {
  호재: "border-l-emerald-500",
  악재: "border-l-red-500",
  중립: "border-l-amber-500",
  단순정보: "border-l-zinc-300",
};

export const categoryDot: Record<string, string> = {
  호재: "bg-emerald-500",
  악재: "bg-red-500",
  중립: "bg-amber-500",
  단순정보: "bg-zinc-400",
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
  if (score >= 80) return "text-red-600";
  if (score >= 50) return "text-amber-600";
  if (score >= 20) return "text-blue-600";
  return "text-zinc-400";
}
