"use client";

import { Calendar, FileText, Mail } from "lucide-react";
import { motion } from "motion/react";
import type { Citation, SourceId } from "@/lib/demo-data";
import { EASE_IRIS } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Provenance. Every claim Kloyya makes names the record it came from.
 *
 * This is the product's central promise rendered as an interface element, not
 * a decoration — remove the chips and the answers become indistinguishable
 * from a chatbot guessing.
 */

const ICONS: Record<SourceId, typeof Mail> = {
  gmail: Mail,
  calendar: Calendar,
  notion: FileText,
};

const NAMES: Record<SourceId, string> = {
  gmail: "gmail",
  calendar: "calendar",
  notion: "notion",
};

export function SourceChip({
  citation,
  className,
}: {
  citation: Citation;
  className?: string;
}) {
  const Icon = ICONS[citation.source];

  return (
    <span
      className={cn(
        "chip inline-flex items-center gap-1.5 transition-colors duration-200 hover:border-hairline-strong hover:text-paper",
        className,
      )}
      title={`${citation.label} — ${citation.when}`}
    >
      <Icon className="size-3 opacity-70" strokeWidth={2} />
      <span className="max-w-[16ch] truncate sm:max-w-[24ch]">{citation.label}</span>
      <span className="text-paper-faint">·</span>
      <span className="text-paper-faint">{citation.when}</span>
    </span>
  );
}

export function CitationRow({
  citations,
  className,
  delay = 0,
}: {
  citations: Citation[];
  className?: string;
  delay?: number;
}) {
  if (!citations.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_IRIS, delay }}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      <span className="mr-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper-faint">
        from
      </span>
      {citations.map((c, i) => (
        <SourceChip key={`${c.source}-${i}`} citation={c} />
      ))}
    </motion.div>
  );
}

export function sourceName(id: SourceId) {
  return NAMES[id];
}

export function SourceIcon({ id, className }: { id: SourceId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} strokeWidth={2} />;
}
