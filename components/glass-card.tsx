"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

type GlassCardProps = HTMLMotionProps<"div"> & {
  /** Adds the gradient hairline that lights on hover. */
  interactive?: boolean;
  /** Opt in to backdrop blur. Capped by convention — see globals.css. */
  blur?: boolean;
};

export function GlassCard({
  className,
  interactive = false,
  blur = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "glass p-5",
        interactive && "glow cursor-pointer",
        blur && "glass-blur",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-paper-faint",
        className,
      )}
    >
      {children}
    </h2>
  );
}
