"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_IRIS } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The mark, and the only place this product spends its boldness.
 *
 * Six ribbons spiral into one center — fragmented sources converging into a
 * single context. It appears four times, and nowhere else:
 *   1. splash        — ribbons converge, lock, then the iris opens
 *   2. building      — each connector lights two blades as its source ingests
 *   3. graph         — the core node everything radiates from
 *   4. skeletons     — a dimmed, slow rotation instead of a linear shimmer
 *
 * Only `transform` and `opacity` animate. Nothing here touches filter or
 * box-shadow, which is what lets it hold 60fps next to a blurred glass panel.
 */

const CENTER = 100;
const BLADES = 6;

/** Polar → cartesian, 0° at twelve o'clock. */
function polar(r: number, deg: number): readonly [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)] as const;
}

const n = (v: number) => v.toFixed(2);

/** One ribbon: an outer arc that spirals inward to the eye and back out. */
function bladePath(i: number): string {
  const R = 92;
  const inner = 24;
  const half = 27;
  const twist = 46;

  const base = i * (360 / BLADES);
  const a0 = base - half;
  const a1 = base + half;

  const [x1, y1] = polar(R, a0);
  const [x2, y2] = polar(R, a1);
  const [cx1, cy1] = polar(R * 0.9, a1 + 12);
  const [cx2, cy2] = polar(inner * 2.0, a1 + 34);
  const [ix, iy] = polar(inner, a1 + twist);
  const [cx3, cy3] = polar(inner * 2.3, a0 + 30);
  const [cx4, cy4] = polar(R * 0.74, a0 + 6);

  return [
    `M${n(x1)} ${n(y1)}`,
    `A${R} ${R} 0 0 1 ${n(x2)} ${n(y2)}`,
    `C${n(cx1)} ${n(cy1)} ${n(cx2)} ${n(cy2)} ${n(ix)} ${n(iy)}`,
    `C${n(cx3)} ${n(cy3)} ${n(cx4)} ${n(cy4)} ${n(x1)} ${n(y1)}`,
    "Z",
  ].join(" ");
}

const PATHS = Array.from({ length: BLADES }, (_, i) => bladePath(i));

export type ApertureState = "converge" | "locked" | "open";

export type ApertureProps = {
  size?: number;
  /** converge: ribbons fly in. locked: at rest. open: iris opens, revealing. */
  state?: ApertureState;
  /** Blade indices rendered at full strength. `"all"` lights every blade. */
  lit?: number[] | "all";
  /** Continuous slow rotation — used while context is being built. */
  spin?: boolean;
  /** Overall opacity multiplier, for skeletons. */
  dim?: number;
  className?: string;
};

export function Aperture({
  size = 220,
  state = "locked",
  lit = "all",
  spin = false,
  dim = 1,
  className,
}: ApertureProps) {
  const gid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();

  const isLit = (i: number) => lit === "all" || lit.includes(i);

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden
      className={cn("overflow-visible", className)}
      style={{ opacity: dim }}
      animate={spin && !reduced ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spin && !reduced
          ? { duration: 22, ease: "linear", repeat: Infinity }
          : { duration: 0 }
      }
    >
      <defs>
        <linearGradient id={`${gid}-ribbon`} x1="0%" y1="10%" x2="100%" y2="90%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="34%" stopColor="#7c5cff" />
          <stop offset="72%" stopColor="#2a6ff6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* The white edge where two ribbons overlap in the logo. */}
        <linearGradient id={`${gid}-glint`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
        </linearGradient>

        <radialGradient id={`${gid}-eye`}>
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.42" />
          <stop offset="70%" stopColor="#2a6ff6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#08080c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The eye. Sits behind the ribbons and never moves. */}
      <circle cx={CENTER} cy={CENTER} r="46" fill={`url(#${gid}-eye)`} />

      {PATHS.map((d, i) => {
        const active = isLit(i);

        const variants = {
          /** Flung outward and invisible — where a converging ribbon starts. */
          spread: { rotate: -52 + i * 3, scale: 1.55, opacity: 0 },
          locked: { rotate: 0, scale: 1, opacity: 1 },
          /** The iris opening: blades rotate away and dilate past the frame. */
          open: { rotate: 26, scale: 1.9, opacity: 0 },
        };

        return (
          <motion.g
            key={i}
            initial={state === "converge" ? "spread" : false}
            animate={state === "converge" ? "locked" : state}
            variants={variants}
            transition={{
              duration: reduced ? 0 : state === "open" ? 0.7 : 0.9,
              ease: EASE_IRIS,
              delay: reduced ? 0 : (state === "open" ? BLADES - 1 - i : i) * 0.055,
            }}
            style={{
              transformBox: "view-box",
              transformOrigin: "100px 100px",
            }}
          >
            <motion.path
              d={d}
              fill={`url(#${gid}-ribbon)`}
              animate={{ opacity: active ? 0.95 : 0.16 }}
              transition={{ duration: 0.5, ease: EASE_IRIS }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={`url(#${gid}-glint)`}
              strokeWidth="1.1"
              animate={{ opacity: active ? 0.7 : 0.08 }}
              transition={{ duration: 0.5, ease: EASE_IRIS }}
            />
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

/** Which two blades a given connector owns. Keeps the ingest lighting legible. */
export const bladesForSource: Record<string, number[]> = {
  gmail: [0, 1],
  calendar: [2, 3],
  notion: [4, 5],
};
