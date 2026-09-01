"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/lib/store";
import { locationName, resourceName } from "@/lib/demo-data";
import { severityTone } from "@/lib/format";
import { ChevronRight } from "lucide-react";

export default function IssuesPage() {
  const { issues, locations, resources, loadingDashboard } = useDemoStore();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Intelligence</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Issues & Recommendations</h1>
        <p className="mt-1 text-sm text-muted">
          Detected from connected events, with evidence and a recommended next action.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {issues.map((issue) => (
          <Link key={issue.id} href={`/issues/${issue.id}`}>
            <Card className="flex flex-col gap-3 transition-colors hover:border-accent/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
                  <Badge tone={issue.status === "resolved" ? "good" : "neutral"}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{issue.title}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted">{issue.description}</p>
                <div className="mt-2 text-[11px] text-muted/70">
                  {locationName(locations, issue.locationId)}
                  {issue.resourceId ? ` · ${resourceName(resources, issue.resourceId)}` : ""} · detected {issue.detectedAt}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-muted">Recommendation</div>
                  <div className="text-xs font-medium text-accent">
                    {Math.round(issue.recommendation.confidence * 100)}% confidence
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </div>
            </Card>
          </Link>
        ))}
        {issues.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
            {loadingDashboard ? "Loading issues…" : "No issues recorded yet."}
          </div>
        )}
      </div>
    </div>
  );
}
