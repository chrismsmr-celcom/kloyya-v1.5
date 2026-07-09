"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { RiskCard } from "@/components/risk-card";
import { SkeletonText } from "@/components/skeleton";
import { CitationRow } from "@/components/source-chip";
import { StreamingText } from "@/components/streaming-text";
import { Button } from "@/components/ui/button";
import { execBrief } from "@/lib/demo-data";
import { DUR, EASE_IRIS, fadeUp, stagger } from "@/lib/motion";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The turn.
 *
 * Kloyya drafts the update from the roadmap, in good faith, with the wrong
 * launch date in paragraph two. Then it reads its own draft against the
 * inbox and catches what the roadmap didn't know. The correction re-types
 * itself in place — the founder watches the sentence change.
 */

type Phase = "idle" | "drafting" | "scanning" | "risk" | "resolved";

const SCAN_MS = 1700;

export default function ExecutiveBriefPage() {
  const reduced = useReducedMotion();
  const contextBuilt = useDemo((s) => s.contextBuilt);
  const briefGenerated = useDemo((s) => s.briefGenerated);
  const setBriefGenerated = useDemo((s) => s.setBriefGenerated);
  const detectRisk = useDemo((s) => s.detectRisk);
  const resolveRisk = useDemo((s) => s.resolveRisk);
  const riskResolved = useDemo((s) => s.riskResolved);

  const [phase, setPhase] = useState<Phase>(() => {
    if (!briefGenerated) return "idle";
    return riskResolved ? "resolved" : "risk";
  });
  const [settled, setSettled] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(briefGenerated ? execBrief.sections.length : 0);

  const drafting = phase === "drafting";

  /** Reveal sections one at a time; a section starts once the last one settles. */
  useEffect(() => {
    if (!drafting) return;
    if (visible === 0) {
      const t = setTimeout(() => setVisible(1), reduced ? 0 : 1100);
      return () => clearTimeout(t);
    }
  }, [drafting, visible, reduced]);

  function onSettled(id: string) {
    setSettled((s) => new Set(s).add(id));

    const idx = execBrief.sections.findIndex((x) => x.id === id);
    if (idx < execBrief.sections.length - 1) {
      setVisible((v) => Math.max(v, idx + 2));
    } else if (drafting) {
      setTimeout(() => setPhase("scanning"), 450);
    }
  }

  /** Read the draft back against the sources. */
  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setTimeout(() => {
      setBriefGenerated(true);
      detectRisk();
      setPhase("risk");
    }, reduced ? 0 : SCAN_MS);
    return () => clearTimeout(t);
  }, [phase, reduced, detectRisk, setBriefGenerated]);

  function correct() {
    resolveRisk();
    setPhase("resolved");
    setSettled((s) => {
      const n = new Set(s);
      n.delete("s-launch");
      return n;
    });
  }

  if (!contextBuilt) return <NotYet />;

  if (phase === "idle") {
    return (
      <motion.div
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        animate="show"
        className="grid min-h-[62vh] place-items-center text-center"
      >
        <div className="flex max-w-md flex-col items-center">
          <motion.h1
            variants={fadeUp}
            className="font-display text-[30px] font-semibold tracking-tight"
          >
            {execBrief.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 text-[15px] leading-relaxed text-paper-dim">
            Kloyya will write this from your inbox, calendar and roadmap, then
            check it against them before you send it.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Button size="lg" onClick={() => setPhase("drafting")}>
              <Sparkles className="size-4" />
              Draft the update
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const resolved = phase === "resolved";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-7">
        <h1 className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          {execBrief.title}
        </h1>
        <p className="mt-1.5 font-mono text-[11px] text-paper-faint">
          {execBrief.meta}
        </p>
      </header>

      <AnimatePresence>
        {(phase === "risk" || resolved) && (
          <div className="mb-6">
            <RiskCard
              resolved={resolved}
              onResolve={resolved ? undefined : correct}
            />
          </div>
        )}
      </AnimatePresence>

      <GlassCard className="relative overflow-hidden !p-7">
        {/* The scan. A single translating gradient — transform only. */}
        <AnimatePresence>
          {phase === "scanning" && (
            <motion.div
              key="scan"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10"
            >
              <motion.div
                className="absolute inset-x-0 h-40"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(124,92,255,0.16), transparent)",
                }}
                initial={{ y: -160 }}
                animate={{ y: 620 }}
                transition={{ duration: SCAN_MS / 1000, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {execBrief.sections.map((section, i) => {
            if (i >= visible) return null;

            const isLaunch = section.id === "s-launch";
            const body =
              isLaunch && resolved && section.corrected
                ? section.corrected
                : section.body;
            const citations =
              isLaunch && resolved && section.correctedCitations
                ? section.correctedCitations
                : section.citations;

            const isSettled = settled.has(section.id);

            return (
              <section key={section.id} className="scroll-mt-24">
                <h2
                  className={cn(
                    "mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em]",
                    isLaunch && phase === "risk"
                      ? "text-signal"
                      : "text-paper-faint",
                  )}
                >
                  {section.heading}
                </h2>

                <div
                  className={cn(
                    "rounded-xl transition-colors duration-500",
                    isLaunch &&
                      phase === "risk" &&
                      "-mx-3 border border-signal/25 bg-signal-dim px-3 py-3",
                  )}
                >
                  <StreamingText
                    // Re-keying on `body` makes the corrected sentence retype itself.
                    key={body}
                    text={body}
                    charsPerSecond={reduced ? 9999 : 78}
                    onDone={() => onSettled(section.id)}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {isSettled && (
                    <CitationRow
                      key={citations.map((c) => c.label).join()}
                      citations={citations}
                      className="mt-3.5"
                    />
                  )}
                </AnimatePresence>
              </section>
            );
          })}

          {visible === 0 && (
            <div className="space-y-4">
              <SkeletonText lines={4} />
              <SkeletonText lines={2} />
            </div>
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {resolved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_IRIS, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <Link href="/dashboard">
              <Button className="group">
                See it on the dashboard
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="font-mono text-[11px] text-paper-faint">
              The roadmap is now flagged stale.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotYet() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-[30px] font-semibold tracking-tight">
        Executive brief
      </h1>
      <p className="text-[15px] text-paper-dim">
        There&apos;s nothing to draft from yet.{" "}
        <Link href="/connect" className="text-iris-violet hover:underline">
          Connect a source
        </Link>
        .
      </p>
    </div>
  );
}
