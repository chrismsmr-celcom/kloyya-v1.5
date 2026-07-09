"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { nodeTypes } from "@/components/graph/nodes";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/skeleton";
import { graphEdges, graphNodes, totalIngested } from "@/lib/demo-data";
import { fadeUp, stagger } from "@/lib/motion";
import { useDemo } from "@/lib/store";

/**
 * Read top to bottom: three sources, the records inside them, and at the
 * bottom the contradiction that only exists in the space between the three.
 */
const POSITIONS: Record<string, { x: number; y: number }> = {
  core: { x: 60, y: -340 },

  "src-gmail": { x: -420, y: -160 },
  "src-notion": { x: 160, y: -160 },
  "src-calendar": { x: 480, y: -160 },

  "p-ife": { x: -640, y: 40 },
  "p-priya": { x: -420, y: 40 },
  "p-sam": { x: -200, y: 40 },
  "doc-roadmap": { x: 40, y: 40 },
  "doc-soc2": { x: 250, y: 40 },
  "ev-investor": { x: 480, y: 40 },

  risk: { x: 60, y: 300 },
};

export default function GraphPage() {
  const contextBuilt = useDemo((s) => s.contextBuilt);

  const nodes = useMemo<Node[]>(
    () =>
      graphNodes.map((n, i) => ({
        id: n.id,
        type: n.kind,
        position: POSITIONS[n.id] ?? { x: 0, y: 0 },
        data: { label: n.label, sub: n.sub, index: i },
        draggable: true,
        connectable: false,
      })),
    [],
  );

  const edges = useMemo<Edge[]>(
    () =>
      graphEdges.map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: e.animated ?? false,
        style: e.animated
          ? { stroke: "rgba(245,165,36,0.55)", strokeWidth: 1.4 }
          : { stroke: "rgba(124,92,255,0.28)", strokeWidth: 1 },
      })),
    [],
  );

  if (!contextBuilt) return <NotYet />;

  return (
    <motion.div variants={stagger(0, 0.08)} initial="hidden" animate="show">
      <motion.header variants={fadeUp} className="mb-6 max-w-2xl">
        <h1 className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          Knowledge graph
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-paper-dim">
          {totalIngested.toLocaleString()} items, resolved into people,
          documents and commitments. The amber node at the bottom exists in no
          single source.
        </p>
      </motion.header>

      <motion.div
        variants={fadeUp}
        className="glass h-[min(62vh,560px)] w-full overflow-hidden !p-0"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.3}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={26}
            size={1}
            color="rgba(237,234,246,0.10)"
          />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-hairline !shadow-none"
          />
        </ReactFlow>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center gap-4">
        <Link href="/chat">
          <Button className="group">
            Ask about it
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
        </Link>
        <p className="font-mono text-[11px] text-paper-faint">
          Drag any node. Scroll to zoom.
        </p>
      </motion.div>
    </motion.div>
  );
}

function NotYet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[30px] font-semibold tracking-tight">
          Knowledge graph
        </h1>
        <p className="mt-2 text-[15px] text-paper-dim">
          The graph is built from your sources.{" "}
          <Link href="/connect" className="text-iris-violet hover:underline">
            Connect one
          </Link>{" "}
          to see it.
        </p>
      </div>
      <SkeletonCard />
    </div>
  );
}
