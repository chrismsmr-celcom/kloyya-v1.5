"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AutonomyLevel } from "@/lib/types";

const levels: { level: AutonomyLevel; label: string }[] = [
  { level: 0, label: "Observe" },
  { level: 1, label: "Recommend" },
  { level: 2, label: "Prepare" },
  { level: 3, label: "Execute" },
  { level: 4, label: "Autonomous" },
];

export function Topbar() {
  const { autonomyLevel, setAutonomyLevel, issues } = useDemoStore();
  const [open, setOpen] = useState(false);
  const openIssues = issues.filter((i) => i.status === "open" || i.status === "investigating").length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search resources, work, issues…"
            className="w-72 rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            Autonomy: <span className="font-medium text-foreground">{levels[autonomyLevel].label}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {open && (
            <div className="panel-float absolute right-0 top-10 z-30 w-52 rounded-md p-1">
              {levels.map((l) => (
                <button
                  key={l.level}
                  onClick={() => {
                    setAutonomyLevel(l.level);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs hover:bg-white/[0.06]",
                    autonomyLevel === l.level ? "text-accent" : "text-muted"
                  )}
                >
                  <span>
                    Level {l.level} · {l.label}
                  </span>
                  {autonomyLevel === l.level && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative rounded-md border border-border bg-surface p-1.5 text-muted hover:text-foreground">
          <Bell className="h-4 w-4" />
          {openIssues > 0 && (
            <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-bad text-[9px] font-medium text-white">
              {openIssues}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 rounded-md border border-border bg-surface py-1 pl-1 pr-2.5">
          <div className="grid h-6 w-6 place-items-center rounded bg-white/[0.08] text-[11px] font-medium text-foreground">
            W
          </div>
          <span className="hidden text-xs font-medium sm:inline">Whelman K</span>
        </div>
      </div>
    </header>
  );
}
