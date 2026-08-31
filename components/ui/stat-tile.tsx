import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "accent" | "good" | "warn" | "bad";
}) {
  const toneColor = {
    neutral: "text-foreground",
    accent: "text-accent",
    good: "text-good",
    warn: "text-warn",
    bad: "text-bad",
  }[tone];

  return (
    <div className="panel rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight tabular-nums", toneColor)}>
        {value}
      </div>
      {detail && <div className="mt-1 text-[11px] text-muted">{detail}</div>}
    </div>
  );
}
