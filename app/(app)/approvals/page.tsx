"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/store";
import { actionStatusTone } from "@/lib/format";

export default function ApprovalsPage() {
  const { issues, approveAction, rejectAction, autonomyLevel } = useDemoStore();

  const pending = issues.filter((i) => i.recommendation.action.status === "pending_approval");
  const inFlight = issues.filter((i) =>
    ["approved", "executing"].includes(i.recommendation.action.status)
  );
  const done = issues.filter((i) => ["completed", "rejected"].includes(i.recommendation.action.status));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Human control layer</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Approval Center</h1>
          <p className="mt-1 text-sm text-muted">
            What happened, what Kloyya recommends, why, and what approving will do.
          </p>
        </div>
        <div className="panel rounded-md px-4 py-2.5 text-xs text-muted">
          Autonomy level <span className="font-semibold text-foreground">{autonomyLevel}</span> — actions
          above this level always require your approval.
        </div>
      </div>

      <Card>
        <CardHeader title="Awaiting your approval" subtitle={`${pending.length} action(s) ready to execute`} />
        <div className="flex flex-col gap-3">
          {pending.map((issue) => {
            const action = issue.recommendation.action;
            return (
              <div key={issue.id} className="rounded-md border border-border bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{action.title}</div>
                    <Link href={`/issues/${issue.id}`} className="text-[11px] text-muted hover:text-accent">
                      From issue: {issue.title}
                    </Link>
                  </div>
                  <Badge tone="good">{Math.round(issue.recommendation.confidence * 100)}% confidence</Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{issue.recommendation.reason}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[11px] font-medium text-accent">{action.estimatedImpact}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => rejectAction(issue.id)}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => approveAction(issue.id)}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
              Nothing waiting on you right now.
            </div>
          )}
        </div>
      </Card>

      {inFlight.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Executing" subtitle="Approved actions Kloyya is running now" />
          <div className="flex flex-col gap-2">
            {inFlight.map((issue) => {
              const action = issue.recommendation.action;
              return (
                <div
                  key={issue.id}
                  className="flex items-center justify-between rounded-md border border-border bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-xs font-medium text-foreground">{action.title}</span>
                  </div>
                  <span className="text-[11px] text-muted">
                    step {Math.min(action.currentStep + 1, action.steps.length)} / {action.steps.length}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {done.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Recently decided" />
          <div className="flex flex-col gap-2">
            {done.map((issue) => {
              const action = issue.recommendation.action;
              return (
                <div
                  key={issue.id}
                  className="flex items-center justify-between rounded-md border border-border bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    {action.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-good" />
                    ) : (
                      <XCircle className="h-4 w-4 text-bad" />
                    )}
                    <span className="text-xs font-medium text-foreground">{action.title}</span>
                  </div>
                  <Badge tone={actionStatusTone(action.status)}>{action.status.replace("_", " ")}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
