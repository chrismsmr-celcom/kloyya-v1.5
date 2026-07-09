import { AppShell } from "@/components/app-shell";

/**
 * Rendered per request so the server clock matches the browser's. Every date in
 * the demo is derived from `now` (see lib/dates.ts) — prerendering this at
 * build time would freeze the story to the day it was compiled and produce a
 * hydration mismatch besides.
 */
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
