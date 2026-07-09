"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Calendar } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { SkeletonCard } from "@/components/skeleton";
import { CitationRow } from "@/components/source-chip";
import { Button } from "@/components/ui/button";
import { D, dailyBrief, docs, events } from "@/lib/demo-data";
import { longDate } from "@/lib/dates";
import { fadeUp, stagger } from "@/lib/motion";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function BriefPage() {
  const contextBuilt = useDemo((s) => s.contextBuilt);

  if (!contextBuilt) return <NotYet />;

  return (
    <motion.div variants={stagger(0, 0.07)} initial="hidden" animate="show">
      <motion.header variants={fadeUp} className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-faint">
          {longDate(D.now)}
        </p>
        <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          Your daily brief
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-paper-dim">
          Four things worth your attention, ordered by what changes if you
          ignore them.
        </p>
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {dailyBrief.map((item, i) => (
            <GlassCard
              key={item.id}
              className={cn(
                "relative",
                item.critical && "border-signal/30",
              )}
            >
              {/* Rank is real information here — the list is ordered by consequence. */}
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "mt-0.5 font-mono text-[11px] tabular-nums",
                    item.critical ? "text-signal" : "text-paper-faint",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[17px] font-semibold leading-snug text-paper">
                    {item.heading}
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-paper-dim">
                    {item.body}
                  </p>
                  <CitationRow citations={item.citations} className="mt-3.5" />
                </div>
              </div>
            </GlassCard>
          ))}

          <motion.div variants={fadeUp} className="pt-1">
            <Link href="/executive">
              <Button variant="glass" className="group w-full sm:w-auto">
                Turn this into an investor update
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <SectionTitle className="mb-4">Coming up</SectionTitle>
            <ul className="space-y-3.5">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <Calendar
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      e.critical ? "text-signal" : "text-paper-faint",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium leading-snug text-paper">
                      {e.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-paper-faint">
                      {e.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <SectionTitle className="mb-4">Docs that moved</SectionTitle>
            <ul className="space-y-3.5">
              {docs.map((d) => (
                <li key={d.id}>
                  <p className="text-[14px] font-medium leading-snug text-paper">
                    {d.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-[11px]",
                      d.stale ? "text-signal/80" : "text-paper-faint",
                    )}
                  >
                    {d.stale ? `stale · edited ${d.edited}` : `edited ${d.edited}`}
                  </p>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}

function NotYet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[30px] font-semibold tracking-tight">
          Your daily brief
        </h1>
        <p className="mt-2 text-[15px] text-paper-dim">
          There&apos;s nothing to summarize until a source is connected.{" "}
          <Link href="/connect" className="text-iris-violet hover:underline">
            Connect one
          </Link>
          .
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
