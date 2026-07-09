"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Command as CommandIcon, Menu, X } from "lucide-react";
import { Aperture } from "@/components/aperture";
import { CommandPalette } from "@/components/command-palette";
import { navItems, nextStep } from "@/lib/nav";
import { allConnected, connectedCount, useDemo } from "@/lib/store";
import { company, founder } from "@/lib/demo-data";
import { EASE_IRIS, pageTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** zustand/persist rehydrates on the client; don't act on state before then. */
function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useDemo.persist.hasHydrated()) setHydrated(true);
    return useDemo.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();

  const authed = useDemo((s) => s.authed);
  const connected = useDemo((s) => s.connected);
  const riskDetected = useDemo((s) => s.riskDetected);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !authed) router.replace("/login");
  }, [hydrated, authed, router]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const next = nextStep(pathname, riskDetected);

  return (
    <div className="min-h-dvh">
      <CommandPalette />

      {/* ── Sidebar (lg+) ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-hairline bg-abyss/50 lg:block">
        <SidebarContent pathname={pathname} connected={connected} />
      </aside>

      {/* ── Drawer (below lg) ─────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-void/70 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.36, ease: EASE_IRIS }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-hairline bg-surface lg:hidden"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-5 grid size-8 place-items-center rounded-lg text-paper-dim hover:bg-white/[0.05]"
              >
                <X className="size-4" />
              </button>
              <SidebarContent pathname={pathname} connected={connected} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="lg:pl-[248px]">
        <header className="glass-blur sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-void/60 px-4 sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="grid size-9 place-items-center rounded-lg text-paper-dim hover:bg-white/[0.05] lg:hidden"
          >
            <Menu className="size-4.5" />
          </button>

          <PaletteHint />

          <div className="ml-auto flex items-center gap-3">
            {next && (
              <Link
                href={next.href}
                className="glow group hidden items-center gap-2 rounded-xl border border-hairline px-3.5 py-2 text-[13px] text-paper-dim transition-colors hover:text-paper sm:flex"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint">
                  next
                </span>
                {next.label}
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            )}

            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-iris-violet to-iris-blue text-[12px] font-semibold text-white">
                {founder.initials}
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-[13px] font-medium text-paper">{founder.name}</div>
                <div className="font-mono text-[10.5px] text-paper-faint">
                  {company.name}
                </div>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            variants={pageTransition}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  connected,
}: {
  pathname: string;
  connected: Record<string, boolean>;
}) {
  const count = connectedCount(connected as never);
  const all = allConnected(connected as never);

  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <Aperture size={30} lit="all" />
        <span className="font-display text-[17px] font-semibold tracking-tight text-paper">
          Kloyya
        </span>
      </Link>

      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors duration-200",
                active
                  ? "text-paper"
                  : "text-paper-dim hover:bg-white/[0.035] hover:text-paper",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ duration: 0.35, ease: EASE_IRIS }}
                  className="absolute inset-0 -z-10 rounded-xl border border-hairline bg-white/[0.05]"
                />
              )}
              <item.icon
                className={cn(
                  "size-4 transition-colors",
                  active ? "text-iris-violet" : "text-paper-faint",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-hairline bg-white/[0.02] p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint">
            context
          </span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              all ? "bg-iris-cyan" : "bg-paper-faint",
            )}
          />
        </div>
        <p className="mt-2 text-[13px] text-paper-dim">
          {all ? "All sources live" : `${count} of 3 sources connected`}
        </p>
      </div>
    </div>
  );
}

function PaletteHint() {
  const [mac, setMac] = useState(true);
  useEffect(() => {
    setMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <button
      onClick={() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
        )
      }
      className="flex items-center gap-2 rounded-xl border border-hairline bg-white/[0.02] px-3 py-2 text-[13px] text-paper-faint transition-colors hover:text-paper-dim"
    >
      <CommandIcon className="size-3.5" />
      <span className="hidden sm:inline">Search or jump</span>
      <kbd className="ml-1 hidden rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] sm:inline">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}
