"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Mail, Plug } from "lucide-react";
import { Aperture } from "@/components/aperture";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { IngestChart } from "@/components/ingest-chart";
import { RiskCard } from "@/components/risk-card";
import { CitationRow } from "@/components/source-chip";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import {
  D,
  dailyBrief,
  founder,
  stats,
  threads,
  totalIngested,
} from "@/lib/demo-data";
import { greeting } from "@/lib/dates";
import { fadeUp, stagger } from "@/lib/motion";
import { useDemo } from "@/lib/store";

/**
 * The demo's hinge.
 *
 * "Building context…", "Risk detected" and "Dashboard updated" are not three
 * pages — they are three states of this one. The loop closes here because the
 * founder ends the demo looking at the same screen they started on, and it is
 * telling them something it could not have told them ninety seconds ago.
 */
export default function DashboardPage() {
  const contextBuilt = useDemo((s) => s.contextBuilt);
  const riskDetected = useDemo((s) => s.riskDetected);
  const riskResolved = useDemo((s) => s.riskResolved);

  if (!contextBuilt) return <EmptyState />;

  return (
    <motion.div variants={stagger(0, 0.07)} initial="hidden" animate="show">
      <motion.header variants={fadeUp} className="mb-7">
        <h1 className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          {greeting(D.now)}, {founder.name.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[15px] text-paper-dim">
          {totalIngested.toLocaleString()} items across three sources, read and
          cross-referenced.
        </p>
      </motion.header>

      <AnimatePresence>
        {riskDetected && (
          <div className="mb-7">
            <RiskCard resolved={riskResolved} />
          </div>
        )}
      </AnimatePresence>

      <motion.div
        variants={stagger(0, 0.05)}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </motion.div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <SectionTitle>Context ingested</SectionTitle>
            <span className="font-mono text-[11px] text-paper-faint">
              last 7 days
            </span>
          </div>
          <IngestChart />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <SectionTitle>Today&apos;s brief</SectionTitle>
            <Link
              href="/brief"
              className="text-[12.5px] text-paper-faint transition-colors hover:text-paper-dim"
            >
              All items
            </Link>
          </div>

          <ul className="space-y-4">
            {dailyBrief.slice(0, 2).map((item) => (
              <li key={item.id} className="space-y-2">
                <p className="text-[14.5px] font-medium leading-snug text-paper">
                  {item.heading}
                </p>
                <CitationRow citations={item.citations} />
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="mt-4">
        <div className="mb-4 flex items-baseline justify-between">
          <SectionTitle>Needs a reply</SectionTitle>
          <span className="font-mono text-[11px] text-paper-faint">
            {threads.filter((t) => t.unread).length} waiting
          </span>
        </div>

        <ul className="divide-y divide-white/[0.05]">
          {threads.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-paper-faint" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[14px] font-medium text-paper">
                    {t.from}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] text-paper-faint">
                    {t.when}
                  </span>
                </div>
                <p className="truncate text-[13.5px] text-paper-dim">{t.subject}</p>
              </div>
              {t.unread && (
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-iris-violet" />
              )}
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}

/* ── Before any source is connected ──────────────────────────────────── */

/**
 * An empty screen is an invitation to act, not an apology. It says what is
 * missing and gives exactly one way to fix it.
 */
function EmptyState() {
  return (
    <motion.div
      variants={stagger(0.1, 0.09)}
      initial="hidden"
      animate="show"
      className="grid min-h-[62vh] place-items-center text-center"
    >
      <div className="flex max-w-md flex-col items-center">
        <motion.div variants={fadeUp} className="bloom relative">
          <Aperture size={110} lit={[]} dim={0.9} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-8 font-display text-[28px] font-semibold tracking-tight"
        >
          Nothing to read yet
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-3 text-[15px] leading-relaxed text-paper-dim">
          Kloyya finds what one tool can&apos;t see alone. Connect your email,
          calendar and docs, and it will tell you what they say together.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8">
          <Link href="/connect">
            <Button size="lg" className="group">
              <Plug className="size-4" />
              Connect your first app
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
