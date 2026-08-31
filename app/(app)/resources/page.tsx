import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { locationName, resources } from "@/lib/demo-data";
import { Boxes, Truck, User, Wrench, Package, Warehouse } from "lucide-react";

const icon: Record<string, typeof Truck> = {
  vehicle: Truck,
  driver: User,
  machine: Wrench,
  inventory: Package,
  warehouse: Warehouse,
};

const statusTone: Record<string, "good" | "neutral" | "warn" | "bad"> = {
  active: "good",
  idle: "neutral",
  maintenance: "warn",
  offline: "bad",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Operational graph</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Resources</h1>
        <p className="mt-1 text-sm text-muted">
          Vehicles, machines, drivers, inventory and facilities — one universal model.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => {
          const Icon = icon[r.type] ?? Boxes;
          return (
            <Link key={r.id} href={`/resources/${r.id}`}>
              <Card className="h-full transition-colors hover:border-accent/30">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                    <div className="text-[11px] text-muted">{locationName(r.locationId)}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  <span
                    className={`text-xs font-semibold ${
                      r.health >= 80 ? "text-good" : r.health >= 55 ? "text-warn" : "text-bad"
                    }`}
                  >
                    {r.health} health
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
