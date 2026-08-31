import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  neutral: "bg-white/[0.04] text-muted border-white/10",
  accent: "bg-accent/10 text-accent border-accent/25",
  good: "bg-good/10 text-good border-good/25",
  warn: "bg-warn/10 text-warn border-warn/25",
  bad: "bg-bad/10 text-bad border-bad/25",
  critical: "bg-critical/10 text-critical border-critical/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium",
        styles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
