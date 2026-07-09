"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Aperture, bladesForSource } from "@/components/aperture";
import { GlassCard } from "@/components/glass-card";
import { SourceIcon } from "@/components/source-chip";
import { Button } from "@/components/ui/button";
import { connectors, ingestLog, totalIngested, type SourceId } from "@/lib/demo-data";
import { DUR, EASE_IRIS, fadeUp, stagger } from "@/lib/motion";
import { allConnected, useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "connecting" | "building" | "done";

export default function ConnectPage() {
  const connected = useDemo((s) => s.connected);
  const connect = useDemo((s) => s.connect);
  const contextBuilt = useDemo((s) => s.contextBuilt);

  const [pending, setPending] = useState<SourceId | null>(null);
  const [phase, setPhase] = useState<Phase>(contextBuilt ? "done" : "connecting");

  const everythingConnected = allConnected(connected);

  /** Once the third source lands, context building starts on its own. */
  useEffect(() => {
    if (everythingConnected && phase === "connecting") {
      const t = setTimeout(() => setPhase("building"), 550);
      return () => clearTimeout(t);
    }
  }, [everythingConnected, phase]);

  const onConnect = useCallback(
    async (id: SourceId, latency: number) => {
      setPending(id);
      await new Promise((r) => setTimeout(r, latency));
      connect(id);
      setPending(null);
    },
    [connect],
  );

  if (phase === "building" || phase === "done") {
    return <BuildingContext phase={phase} onDone={() => setPhase("done")} />;
  }

  return (
    <motion.div variants={stagger(0, 0.08)} initial="hidden" animate="show">
      <motion.header variants={fadeUp} className="mb-8 max-w-xl">
        <h1 className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          Connect your sources
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-paper-dim">
          Kloyya reads each one on its own, then reads them against each other.
          The third connection is where it gets interesting.
        </p>
      </motion.header>

      <div className="grid gap-4 md:grid-cols-3">
        {connectors.map((c) => {
          const isConnected = connected[c.id];
          const isPending = pending === c.id;

          return (
            <GlassCard
              key={c.id}
              interactive={!isConnected}
              data-active={isConnected}
              className="flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                  <SourceIcon
                    id={c.id}
                    className={cn(
                      "size-5 transition-colors duration-500",
                      isConnected ? "text-iris-cyan" : "text-paper-dim",
                    )}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {isConnected && (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: DUR.base, ease: EASE_IRIS }}
                      className="grid size-6 place-items-center rounded-full bg-iris-violet/15 text-iris-cyan"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <h2 className="mt-4 font-display text-[17px] font-semibold text-paper">
                {c.name}
              </h2>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-paper-dim">
                {c.detail}
              </p>

              <div className="mt-5">
                {isConnected ? (
                  <div className="flex items-center justify-between font-mono text-[11px] text-paper-faint">
                    <span className="truncate">{c.account}</span>
                    <span>{c.itemCount.toLocaleString()}</span>
                  </div>
                ) : (
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => onConnect(c.id, c.latency)}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Authorizing
                      </>
                    ) : (
                      `Connect ${c.name}`
                    )}
                  </Button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <motion.p
        variants={fadeUp}
        className="mt-7 text-center font-mono text-[11px] text-paper-faint"
      >
        Prototype — no OAuth is performed and no account is read.
      </motion.p>
    </motion.div>
  );
}

/* ── Building context ────────────────────────────────────────────────── */

const LINE_MS = 900;

/**
 * The second use of the aperture: each source lights its two ribbons as its
 * records are read, so the mark fills in as the context does. The last line of
 * the log is the whole demo in four words.
 */
function BuildingContext({ phase, onDone }: { phase: Phase; onDone: () => void }) {
  const setContextBuilt = useDemo((s) => s.setContextBuilt);
  const contextBuilt = useDemo((s) => s.contextBuilt);

  const [step, setStep] = useState(contextBuilt ? ingestLog.length : 0);
  const done = phase === "done";

  useEffect(() => {
    if (done) return;

    if (step >= ingestLog.length) {
      const t = setTimeout(() => {
        setContextBuilt(true);
        onDone();
      }, 800);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setStep((s) => s + 1), LINE_MS);
    return () => clearTimeout(t);
  }, [step, done, setContextBuilt, onDone]);

  /** A ribbon lights the moment its source first appears in the log. */
  const lit = useMemo(() => {
    if (done) return "all" as const;
    const seen = new Set(ingestLog.slice(0, step).map((l) => l.source));
    return [...seen].flatMap((s) => bladesForSource[s] ?? []);
  }, [step, done]);

  const progress = done ? 1 : Math.min(1, step / ingestLog.length);
  const visible = ingestLog.slice(0, step);

  return (
    <div className="grid min-h-[68vh] place-items-center">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="bloom relative">
          <Aperture size={168} lit={lit} spin={!done} />
        </div>

        <h1 className="mt-9 font-display text-[26px] font-semibold tracking-tight sm:text-[30px]">
          {done ? "Context built" : "Building context…"}
        </h1>

        <p className="mt-2.5 text-[15px] text-paper-dim">
          {done
            ? `${totalIngested.toLocaleString()} items read, cross-referenced, and linked.`
            : "Reading each source, then reading them against each other."}
        </p>

        {/* Progress. scaleX on the GPU, not a width transition. */}
        <div className="mt-8 h-px w-full max-w-sm overflow-hidden bg-white/[0.07]">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-iris-violet to-iris-cyan"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.7, ease: EASE_IRIS }}
          />
        </div>

        {/* The log. Fixed height so nothing below it jumps. */}
        <div className="mt-6 h-[128px] w-full max-w-sm">
          <AnimatePresence initial={false}>
            {visible.slice(-4).map((line) => (
              <motion.div
                key={line.line}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.36, ease: EASE_IRIS }}
                className="flex items-center gap-2.5 py-1.5"
              >
                <SourceIcon
                  id={line.source}
                  className="size-3 shrink-0 text-iris-violet/70"
                />
                <span
                  className={cn(
                    "font-mono text-[12px]",
                    line.line.includes("contradiction")
                      ? "text-signal"
                      : "text-paper-faint",
                  )}
                >
                  {line.line}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE_IRIS }}
            >
              <Link href="/graph">
                <Button size="lg" className="group">
                  See the knowledge graph
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
