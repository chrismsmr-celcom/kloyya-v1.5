"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Boxes,
  ListChecks,
  AlertTriangle,
  ShieldCheck,
  Bot,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/store";

const nav = [
  { href: "/command-center", label: "Command Center", icon: LayoutDashboard },
  { href: "/issues", label: "Issues & Recommendations", icon: AlertTriangle },
  { href: "/approvals", label: "Approval Center", icon: ShieldCheck },
  { href: "/work", label: "Work", icon: ListChecks },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/resources", label: "Resources", icon: Boxes },
  { href: "/ai", label: "Ask Kloyya", icon: Bot },
  { href: "/outcomes", label: "Outcomes", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const { issues, orgProfile } = useDemoStore();
  const pendingApprovals = issues.filter(
    (i) => i.recommendation.action.status === "pending_approval"
  ).length;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-4 lg:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <Image src="/kloyya-mark.png" alt="Kloyya" width={22} height={22} className="shrink-0" />
        <div className="text-sm font-medium leading-none">Kloyya</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = item.href === "/approvals" ? pendingApprovals : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <item.icon
                  className={cn("h-4 w-4", active ? "text-accent" : "text-muted group-hover:text-foreground")}
                  strokeWidth={1.75}
                />
                {item.label}
              </span>
              {badge > 0 && (
                <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-md border border-border bg-surface-2 p-3">
        <div className="truncate text-[11px] font-medium text-foreground">{orgProfile.name}</div>
        <div className="mt-0.5 text-[11px] text-muted">{orgProfile.industry}</div>
      </div>
    </aside>
  );
}
