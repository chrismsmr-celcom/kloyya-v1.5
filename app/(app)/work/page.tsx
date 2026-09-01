"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/lib/store";
import { locationName } from "@/lib/demo-data";
import type { WorkStatus } from "@/lib/types";
import { Clock, MapPin, User } from "lucide-react";

const columns: { status: WorkStatus; label: string }[] = [
  { status: "open", label: "Open" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "completed", label: "Completed" },
];

export default function WorkPage() {
  const { work, locations } = useDemoStore();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Operations</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Work</h1>
        <p className="mt-1 text-sm text-muted">
          Deliveries, work orders, inspections and incidents — the universal work record.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {columns.map((col) => {
          const items = work.filter((w) => w.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted">{col.label}</span>
                <span className="text-[11px] text-muted/70">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((w) => (
                  <Card key={w.id} className="p-3.5">
                    <div className="text-xs font-medium leading-snug text-foreground">{w.title}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {locationName(locations, w.locationId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {w.assignee}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <Badge tone={w.priority === "high" ? "bad" : w.priority === "medium" ? "warn" : "neutral"}>
                        {w.priority}
                      </Badge>
                      {!!w.delayMinutes && (
                        <span className="flex items-center gap-1 text-[10.5px] font-medium text-bad">
                          <Clock className="h-3 w-3" /> +{w.delayMinutes}m
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-border p-4 text-center text-[11px] text-muted/60">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
