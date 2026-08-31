import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { locations } from "@/lib/demo-data";
import { MapPin } from "lucide-react";

const typeLabel: Record<string, string> = {
  depot: "Depot",
  warehouse: "Warehouse",
  customer_location: "Customer site",
  office: "Office",
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Physical footprint</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Locations</h1>
        <p className="mt-1 text-sm text-muted">
          Sites as first-class objects — with teams, resources, work and issues attached.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {locations.map((loc) => (
          <Link key={loc.id} href={`/locations/${loc.id}`}>
            <Card className="h-full transition-colors hover:border-accent/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{loc.name}</div>
                    <div className="text-[11px] text-muted">
                      {typeLabel[loc.type]} · {loc.city}, {loc.country}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    loc.health >= 85 ? "text-good" : loc.health >= 70 ? "text-warn" : "text-bad"
                  }`}
                >
                  {loc.health}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
                <span>{loc.activeWork} active work</span>
                <span className="flex items-center gap-1">
                  {loc.openIssues > 0 && <Badge tone="warn">{loc.openIssues} open issue{loc.openIssues > 1 ? "s" : ""}</Badge>}
                  {loc.openIssues === 0 && <Badge tone="good">Clear</Badge>}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
