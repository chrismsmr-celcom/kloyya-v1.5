"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Radio } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthRing } from "@/components/ui/health-ring";
import { locationName } from "@/lib/demo-data";
import { useDemoStore } from "@/lib/store";
import { severityTone } from "@/lib/format";

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { issues, work, resources, locations } = useDemoStore();
  const resource = resources.find((r) => r.id === params.id);

  if (!resource) {
    return <p className="text-sm text-muted">Resource not found.</p>;
  }

  const relatedIssues = issues.filter((i) => i.resourceId === resource.id);
  const relatedWork = work.filter((w) => w.resourceIds.includes(resource.id));

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => router.push("/resources")}
        className="mb-5 flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to resources
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HealthRing value={resource.health} size={72} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{resource.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {resource.type} · {locationName(locations, resource.locationId)}
            </p>
          </div>
        </div>
        <Badge tone={resource.status === "active" ? "good" : resource.status === "maintenance" ? "warn" : "neutral"}>
          {resource.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Live metrics" subtitle="From connected telematics / sensors" />
          <div className="grid grid-cols-2 gap-3">
            {resource.metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-white/[0.02] p-3">
                <div className="text-[10.5px] text-muted">{m.label}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">{m.value}</div>
              </div>
            ))}
            {resource.metrics.length === 0 && <p className="text-xs text-muted">No metrics reported.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent events" />
          <div className="flex flex-col gap-2">
            {resource.recentEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 py-2.5 text-xs text-muted">
                <Radio className="h-3 w-3 shrink-0 text-accent" />
                {e}
              </div>
            ))}
            {resource.recentEvents.length === 0 && <p className="text-xs text-muted">No recent events.</p>}
          </div>
        </Card>

        {relatedIssues.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader title="Related issues" />
            <div className="flex flex-col gap-2">
              {relatedIssues.map((i) => (
                <Link
                  key={i.id}
                  href={`/issues/${i.id}`}
                  className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.045]"
                >
                  <span className="text-xs text-foreground">{i.title}</span>
                  <Badge tone={severityTone(i.severity)}>{i.severity}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {relatedWork.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader title="Associated work" />
            <div className="flex flex-col gap-2">
              {relatedWork.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                  <span className="text-xs text-foreground">{w.title}</span>
                  <Badge tone="neutral">{w.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
