"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Direction is carried by the glyph, not by hue. Two reasons: color-alone
 * encoding fails for a colorblind viewer, and this product reserves its only
 * non-brand color for detected risk. A red "runway -1mo" would compete with it.
 */
export function StatTile({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  const Arrow = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div variants={fadeUp} className="glass glow p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint">
        {label}
      </p>
      <p className="mt-2.5 font-display text-[26px] font-semibold tracking-tight text-paper sm:text-[30px]">
        {value}
      </p>
      <p
        className={cn(
          "mt-1.5 flex items-center gap-1 text-[12.5px]",
          positive ? "text-paper-dim" : "text-paper-faint",
        )}
      >
        <Arrow className="size-3.5" strokeWidth={2.4} />
        {delta}
        <span className="text-paper-faint">vs last month</span>
      </p>
    </motion.div>
  );
}
