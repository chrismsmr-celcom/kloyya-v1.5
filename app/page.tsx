"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Calendar, FileText, Mail } from "lucide-react";
import { Aperture, type ApertureState } from "@/components/aperture";
import { Button } from "@/components/ui/button";
import { DUR, EASE_IRIS, fadeUp, stagger } from "@/lib/motion";

export default function LandingPage() {
  return (
    <>
      <Splash />
      <Landing />
    </>
  );
}

/* ── Page 1a: the splash ─────────────────────────────────────────────── */

/**
 * Six ribbons converge, lock for a beat, then the iris dilates open and the
 * landing page is revealed behind it. ~2.9s, and it is the first and last time
 * the demo asks the room to just watch.
 */
function Splash() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<ApertureState>("converge");
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setGone(true);
      return;
    }
    const open = setTimeout(() => setState("open"), 1750);
    const done = setTimeout(() => setGone(true), 2700);
    return () => {
      clearTimeout(open);
      clearTimeout(done);
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_IRIS }}
          className="fixed inset-0 z-100 grid place-items-center bg-void"
        >
          <div className="relative grid place-items-center">
            <Aperture size={260} state={state} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: state === "open" ? 0 : 1 }}
              transition={{ duration: 0.55, ease: EASE_IRIS, delay: 0.5 }}
              className="absolute -bottom-14 font-mono text-[11px] uppercase tracking-[0.34em] text-paper-faint"
            >
              Kloyya
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Page 1b: the landing ────────────────────────────────────────────── */

const SOURCES = [
  { icon: Mail, label: "Gmail" },
  { icon: Calendar, label: "Calendar" },
  { icon: FileText, label: "Notion" },
];

function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Aperture size={28} />
          <span className="font-display text-[17px] font-semibold tracking-tight">
            Kloyya
          </span>
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
      </header>

      <motion.section
        variants={stagger(0.15, 0.09)}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24"
      >
        <motion.p
          variants={fadeUp}
          className="chip !rounded-full !px-3.5 !py-1.5"
        >
          Context layer for founders
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="mt-7 font-display text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[64px]"
        >
          Everything you run,
          <br />
          <span className="text-gradient">in one context.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper-dim"
        >
          Your email, calendar and docs each hold a piece of the truth. Kloyya
          reads across all of them and tells you the thing none of them can say
          alone.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/login">
            <Button size="lg" className="group">
              Start the demo
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <span className="font-mono text-[11px] text-paper-faint">
            90 seconds, no signup
          </span>
        </motion.div>

        {/* Sources converging — the thesis, stated once, quietly. */}
        <motion.div
          variants={fadeUp}
          className="mt-20 flex w-full flex-col items-center"
        >
          <div className="flex items-center gap-3 sm:gap-6">
            {SOURCES.map((s, i) => (
              <motion.div
                key={s.label}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 3.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                className="glass flex items-center gap-2 !rounded-full px-4 py-2.5"
              >
                <s.icon className="size-3.5 text-paper-faint" strokeWidth={2} />
                <span className="text-[13px] text-paper-dim">{s.label}</span>
              </motion.div>
            ))}
          </div>

          {/* The viewBox matches the pill row's real width, so each line leaves
              its own source rather than landing between two of them. */}
          <motion.svg
            viewBox="0 0 340 58"
            className="mt-2 h-14 w-[248px] overflow-visible sm:w-[340px]"
            aria-hidden
          >
            {[44, 168, 291].map((x, i) => (
              <motion.path
                key={x}
                d={`M${x} 0 C ${x} 32, 168 24, 168 56`}
                stroke="rgba(124,92,255,0.35)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: DUR.epic,
                  ease: EASE_IRIS,
                  delay: 0.8 + i * 0.12,
                }}
              />
            ))}
          </motion.svg>

          <div className="relative -mt-1">
            <Aperture size={64} spin />
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
            one answer
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}
