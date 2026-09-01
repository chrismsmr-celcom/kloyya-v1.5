// components/auth/login-showcase.tsx

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const slides = [
  {
    icon: AlertTriangle,
    title: "Kloyya spots problems before they cost you.",
    detail:
      "Delays, overdue maintenance, low inventory — flagged the moment they happen, with evidence attached.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing executes without your approval.",
    detail:
      "Every recommendation comes with a clear action plan. You stay in control of autonomy level.",
  },
  {
    icon: TrendingUp,
    title: "Measured in outcomes, not activity.",
    detail:
      "Delays reduced, downtime prevented, hours saved — the numbers that actually matter to the business.",
  },
];

export function LoginShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const Slide = slides[index];
  const Icon = Slide.icon;

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-[#0b0c0e] lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Fond animé */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 30, -10, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-good/15 blur-3xl"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent,rgba(0,0,0,0.4))]" />

      <div className="relative z-10 flex items-center gap-2.5">
        <Image
          src="/kloyya-mark.png"
          alt="Kloyya"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="text-sm font-medium tracking-wide text-foreground">
          Kloyya
        </span>
      </div>

      <div className="relative z-10 max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-white/[0.06] text-accent backdrop-blur">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-foreground">
              {Slide.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {Slide.detail}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-accent" : "w-3 bg-white/15 hover:bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-[11px] text-muted/70">
        Business Command Center · Operations, Autonomy, Outcomes
      </div>
    </div>
  );
}
