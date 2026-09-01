"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/store";
import { locationName, resourceName } from "@/lib/demo-data";
import { severityTone } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { issues, locations, resources, approveAction, rejectAction } = useDemoStore();
  const issue = issues.find((i) => i.id === params.id);

  if (!issue) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted">Issue not found.</p>
        <button onClick={() => router.push("/issues")} className="mt-2 text-sm text-accent">
          Back to issues
        </button>
      </div>
    );
  }

  const action = issue.recommendation.action;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.push("/issues")}
        className="mb-5 flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to issues
      </button>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
        <Badge tone={issue.status === "resolved" ? "good" : "neutral"}>{issue.status.replace("_", " ")}</Badge>
        <span className="text-[11px] text-muted">
          {locationName(locations, issue.locationId)}
          {issue.resourceId ? ` · ${resourceName(resources, issue.resourceId)}` : ""} · detected {issue.detectedAt}
        </span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{issue.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{issue.description}</p>

      <Card className="mt-6">
        <CardHeader title="Evidence" subtitle="Every recommendation Kloyya makes is explainable" />
        <div className="flex flex-col gap-2.5">
          {issue.evidence.map((e, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
              <span className="text-xs text-foreground">{e.label}</span>
              <span className="shrink-0 pl-3 text-[11px] font-medium text-muted">
                {Math.round(e.confidence * 100)}%
              </span>
            </div>
          ))}
          {issue.evidence.length === 0 && <p className="text-xs text-muted">No evidence recorded.</p>}
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader
          title={issue.recommendation.title}
          subtitle="AI recommendation"
          right={<Badge tone="good">{Math.round(issue.recommendation.confidence * 100)}% confidence</Badge>}
        />
        <p className="text-sm leading-relaxed text-muted">{issue.recommendation.reason}</p>

        <div className="mt-4 rounded-md border border-border bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">{action.title}</span>
            <Badge tone={action.status === "completed" ? "good" : action.status === "rejected" ? "bad" : "accent"}>
              {action.status.replace("_", " ")}
            </Badge>
          </div>

          <ol className="flex flex-col gap-2">
            {action.steps.map((step, i) => {
              const done = i < action.currentStep;
              const active = i === action.currentStep && action.status === "executing";
              return (
                <li key={step} className="flex items-center gap-2.5 text-xs">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-good" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
                  ) : (
                    <CircleDashed className="h-4 w-4 shrink-0 text-muted/50" />
                  )}
                  <span className={cn(done ? "text-foreground" : active ? "text-accent" : "text-muted")}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-muted">{action.estimatedImpact}</span>
            {action.status === "pending_approval" && (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => rejectAction(issue.id)}>
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button size="sm" variant="primary" onClick={() => approveAction(issue.id)}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Approve & execute
                </Button>
              </div>
            )}
            {action.status === "completed" && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-good">
                <CheckCircle2 className="h-3.5 w-3.5" /> Outcome verified
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
