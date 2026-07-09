import {
  Boxes,
  LayoutDashboard,
  MessagesSquare,
  Plug,
  Presentation,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connect", label: "Connect apps", icon: Plug },
  { href: "/graph", label: "Knowledge graph", icon: Boxes },
  { href: "/chat", label: "Ask Kloyya", icon: MessagesSquare },
  { href: "/brief", label: "Daily brief", icon: Sun },
  { href: "/executive", label: "Executive brief", icon: Presentation },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * The scripted path, as a linked list. The topbar reads this to show the
 * presenter what comes next, so nobody has to remember the running order
 * with a room watching.
 */
const NEXT: Record<string, { href: string; label: string } | null> = {
  "/dashboard": { href: "/connect", label: "Connect apps" },
  "/connect": { href: "/graph", label: "Knowledge graph" },
  "/graph": { href: "/chat", label: "Ask Kloyya" },
  "/chat": { href: "/executive", label: "Draft investor brief" },
  "/executive": { href: "/dashboard", label: "Back to dashboard" },
  "/brief": null,
  "/settings": null,
};

export function nextStep(pathname: string, riskDetected: boolean) {
  if (pathname === "/dashboard" && riskDetected) return null;
  return NEXT[pathname] ?? null;
}
