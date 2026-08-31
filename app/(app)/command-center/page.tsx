"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { HealthRing } from "@/components/ui/health-ring";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/store";
import { locationName, outcomes, resourceName, work as allWork } from "@/lib/demo-data";
import { severityTone } from "@/lib/format";

export default function CommandCenterPage() {
  const { issues, approveAction, orgProfile } = useDemoStore();
  const open = issues.filter((i) => i.status === "open" || i.status === "investigating");
  const critical = open.filter((i) => i.severity === "critical" || i.severity === "high").length;
  const pendingApprovals = issues.filter((i) => i.recommendation.action.status === "pending_approval");
  const atRisk = allWork.filter((w) => w.status === "blocked" || (w.delayMinutes ?? 0) > 0).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted">
            Business Command Center
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Here&apos;s what&apos;s happening across {orgProfile.name}
          </h1>
        </div>
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground hover:bg-white/[0.05]"
        >
          Ask Kloyya what&apos;s wrong
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="flex items-center gap-4 md:col-span-1">
          <HealthRing value={87} size={80} />
          <div>
            <div className="text-xs font-medium text-muted">Operational health</div>
            <div className="mt-1 text-[11px] text-muted">Up 4 pts vs. last week</div>
          </div>
        </Card>
        <StatTile
          label="Critical / high issues"
          value={String(critical)}
          detail={`${open.length} open total`}
          icon={AlertTriangle}
          tone={critical > 0 ? "bad" : "good"}
        />
        <StatTile
          label="Work at risk"
          value={String(atRisk)}
          detail={`${allWork.length} active work items`}
          icon={Clock}
          tone={atRisk > 0 ? "warn" : "good"}
        />
        <StatTile
          label="Awaiting approval"
          value={String(pendingApprovals.length)}
          detail="Actions ready to execute"
          icon={ShieldCheck}
          tone="accent"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Priorities"
            subtitle="What Kloyya thinks needs your attention first"
            right={
              <Link href="/issues" className="text-xs font-medium text-accent hover:underline">
                View all issues
              </Link>
            }
          />
          <div className="flex flex-col gap-3">
            {open.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
                    <span className="truncate text-sm font-medium text-foreground">{issue.title}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {locationName(issue.locationId)}
                    {issue.resourceId ? ` · ${resourceName(issue.resourceId)}` : ""} · {issue.detectedAt}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {issue.recommendation.action.status === "pending_approval" ? (
                    <Button size="sm" variant="primary" onClick={() => approveAction(issue.id)}>
                      Approve fix
                    </Button>
                  ) : (
                    <Badge tone="accent">{issue.recommendation.action.status.replace("_", " ")}</Badge>
                  )}
                  <Link href={`/issues/${issue.id}`}>
                    <Button size="sm" variant="secondary">
                      Investigate
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {open.length === 0 && (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
                No open issues. Everything is operating within policy.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="This week's outcomes"
            subtitle="Business results, not just AI activity"
            right={
              <Link href="/outcomes" className="text-xs font-medium text-accent hover:underline">
                Full report
              </Link>
            }
          />
          <div className="flex flex-col divide-y divide-border">
            {outcomes.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-xs font-medium text-foreground">{o.label}</div>
                  <div className="text-[11px] text-muted">{o.detail}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-good">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {o.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recommendations pending review"
          subtitle="Kloyya proposed these actions — nothing executes without policy approval"
          right={
            <Link href="/approvals" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Approval Center <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-md border border-border bg-white/[0.02] p-4">
              <div className="text-xs font-medium text-muted">{issue.recommendation.title}</div>
              <div className="mt-1.5 text-[11px] leading-relaxed text-muted/80 line-clamp-2">
                {issue.recommendation.reason}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone="good">{Math.round(issue.recommendation.confidence * 100)}% confidence</Badge>
                <span className="text-[11px] font-medium text-accent">
                  {issue.recommendation.estimatedSavings}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
