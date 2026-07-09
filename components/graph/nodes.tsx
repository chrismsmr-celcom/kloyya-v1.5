"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "motion/react";
import { AlertTriangle, Calendar, FileText, Mail, User } from "lucide-react";
import { Aperture } from "@/components/aperture";
import { EASE_IRIS } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Layout is tiered rather than radial: sources at the top, the records they
 * hold beneath them, and the one thing none of them knew alone at the bottom.
 * The graph is read downward, the way the aperture's ribbons are read inward.
 */

type Data = { label: string; sub?: string; index: number };

const enter = (index: number) => ({
  initial: { opacity: 0, scale: 0.86 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: EASE_IRIS, delay: 0.1 + index * 0.055 },
});

function Pins() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!size-1 !border-0 !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-1 !border-0 !bg-transparent"
      />
    </>
  );
}

export function CoreNode({ data }: NodeProps) {
  const d = data as unknown as Data;
  return (
    <motion.div {...enter(d.index)} className="relative grid place-items-center">
      <Pins />
      <div className="bloom relative">
        <Aperture size={92} spin />
      </div>
      <div className="mt-1 text-center">
        <p className="font-display text-[15px] font-semibold text-paper">{d.label}</p>
        <p className="font-mono text-[10px] text-paper-faint">{d.sub}</p>
      </div>
    </motion.div>
  );
}

const SOURCE_ICONS = { Gmail: Mail, Calendar, Notion: FileText } as const;

export function SourceNode({ data }: NodeProps) {
  const d = data as unknown as Data;
  const Icon = SOURCE_ICONS[d.label as keyof typeof SOURCE_ICONS] ?? FileText;

  return (
    <motion.div
      {...enter(d.index)}
      className="glass glow w-[168px] px-3.5 py-3"
      data-active="true"
    >
      <Pins />
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 shrink-0 text-iris-cyan" strokeWidth={2} />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-paper">{d.label}</p>
          <p className="truncate font-mono text-[10px] text-paper-faint">{d.sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

function LeafNode({ data, icon: Icon }: NodeProps & { icon: typeof User }) {
  const d = data as unknown as Data;
  return (
    <motion.div {...enter(d.index)} className="glass w-[158px] px-3 py-2.5">
      <Pins />
      <div className="flex items-center gap-2.5">
        <Icon className="size-3.5 shrink-0 text-paper-faint" strokeWidth={2} />
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium text-paper">{d.label}</p>
          <p className="truncate font-mono text-[10px] text-paper-faint">{d.sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

export const PersonNode = (p: NodeProps) => <LeafNode {...p} icon={User} />;
export const DocNode = (p: NodeProps) => <LeafNode {...p} icon={FileText} />;
export const EventNode = (p: NodeProps) => <LeafNode {...p} icon={Calendar} />;

/** The only amber node. Everything above it is brand-colored. */
export function RiskNode({ data }: NodeProps) {
  const d = data as unknown as Data;
  return (
    <motion.div
      {...enter(d.index)}
      className="relative w-[210px] rounded-2xl border border-signal/40 bg-signal-dim px-4 py-3"
    >
      <Pins />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,165,36,0.35), transparent 75%)",
        }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="size-4 shrink-0 text-signal" strokeWidth={2.2} />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-signal">
            {d.label}
          </p>
          <p className="truncate font-mono text-[10px] text-signal/70">{d.sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

export const nodeTypes = {
  core: CoreNode,
  source: SourceNode,
  person: PersonNode,
  doc: DocNode,
  event: EventNode,
  risk: RiskNode,
};

export const nodeClass = (kind: string) => cn(kind === "risk" && "z-10");
