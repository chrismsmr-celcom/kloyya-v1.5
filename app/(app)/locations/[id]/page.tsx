"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthRing } from "@/components/ui/health-ring";
import { useDemoStore } from "@/lib/store";
import { severityTone, workStatusLabel, workStatusTone } from "@/lib/format";

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { issues, work, locations, resources } = useDemoStore();
  const loc = locations.find((l) => l.id === params.id);

  if (!loc) {
    return <p className="text-sm text-muted">Location not found.</p>;
  }

  const locResources = resources.filter((r) => r.locationId === loc.id);
  const locWork = work.filter((w) => w.locationId === loc.id);
  const locIssues = issues.filter((i) => i.locationId === loc.id);

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => router.push("/locations")}
        className="mb-5 flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to locations
      </button>

      <div className="mb-6 flex items-center gap-4">
        <HealthRing value={loc.health} size={72} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{loc.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {loc.city}, {loc.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Resources here" subtitle={`${locResources.length} resource(s)`} />
          <div className="flex flex-col gap-2">
            {locResources.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                <span className="text-xs text-foreground">{r.name}</span>
                <Badge tone="neutral">{r.status}</Badge>
              </div>
            ))}
            {locResources.length === 0 && <p className="text-xs text-muted">No resources assigned.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Open issues" subtitle={`${locIssues.length} at this site`} />
          <div className="flex flex-col gap-2">
            {locIssues.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                <span className="text-xs text-foreground">{i.title}</span>
                <Badge tone={severityTone(i.severity)}>{i.severity}</Badge>
              </div>
            ))}
            {locIssues.length === 0 && <p className="text-xs text-muted">Nothing flagged.</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Work at this site" subtitle={`${locWork.length} item(s)`} />
          <div className="flex flex-col gap-2">
            {locWork.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                <span className="text-xs text-foreground">{w.title}</span>
                <Badge tone={workStatusTone(w.status)}>{workStatusLabel(w.status)}</Badge>
              </div>
            ))}
            {locWork.length === 0 && <p className="text-xs text-muted">No active work.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
