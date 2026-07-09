"use client";

import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import { risk } from "@/lib/demo-data";
import { EASE_IRIS } from "@/lib/motion";
import { SourceChip } from "@/components/source-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The only amber in the product.
 *
 * Everything else — every button, chart, chip, edge and node — lives inside
 * the violet→blue iris gradient. Because nothing competes with it, this reads
 * as an alarm without needing size, motion or a single extra pixel.
 */

export function RiskCard({
  onResolve,
  resolved = false,
  compact = false,
  className,
}: {
  onResolve?: () => void;
  resolved?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.62, ease: EASE_IRIS }}
      className={cn(
        "relative overflow-hidden rounded-[18px] border p-5",
        resolved
          ? "border-hairline bg-white/[0.02]"
          : "border-signal/35 bg-signal-dim",
        className,
      )}
    >
      {/* Bloom, opacity-animated only. Unmounted once resolved — animating it
          to zero leaves an amber ghost on any card that mounts already-resolved,
          which is exactly how the dashboard renders it. */}
      {!resolved && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(245,165,36,0.30), transparent 72%)",
          }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
        />
      )}

      <div className="relative flex items-start gap-3.5">
        <div
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border",
            resolved
              ? "border-hairline text-paper-dim"
              : "border-signal/40 bg-signal/10 text-signal",
          )}
        >
          {resolved ? (
            <Check className="size-4" strokeWidth={2.4} />
          ) : (
            <AlertTriangle className="size-4" strokeWidth={2.2} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.16em]",
                resolved ? "text-paper-faint" : "text-signal",
              )}
            >
              {resolved ? "Risk resolved" : "Risk detected"}
            </span>
            {!resolved && (
              <span className="chip !border-signal/25 !text-signal/80">
                {risk.detectedIn}
              </span>
            )}
          </div>

          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-paper">
            {resolved
              ? "Launch date corrected before it left the building"
              : risk.title}
          </h3>

          {!compact && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-paper-dim">
              {resolved
                ? `The brief now reads ${risk.correction.to}, sourced from engineering rather than the stale roadmap.`
                : risk.summary}
            </p>
          )}

          {!resolved && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              {risk.citations.map((c, i) => (
                <SourceChip key={i} citation={c} />
              ))}
            </div>
          )}

          {!resolved && onResolve && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="signal" size="sm" onClick={onResolve}>
                Correct the date
                <ArrowRight className="size-3.5" />
              </Button>
              <span className="font-mono text-[11px] text-paper-faint">
                {risk.correction.from} → {risk.correction.to}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
