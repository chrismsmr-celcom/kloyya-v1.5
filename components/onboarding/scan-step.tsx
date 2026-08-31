"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eyebrow, NextButton, Step, Title } from "./primitives";
import { SCAN_LINES, firstSentence } from "@/lib/onboarding-data";

// The "Kloyya is learning your business" step: a count-up animation followed by
// a short summary reflecting back what was entered earlier in the flow.
export function ScanStep({
  name,
  industry,
  description,
  connectedLabels,
  country,
  locationCount,
  onDone,
}: {
  name: string;
  industry: string;
  description: string;
  connectedLabels: string[];
  country: string | null;
  locationCount: number;
  onDone: () => void;
}) {
  const targets = { events: 1284, resources: 42, locations: locationCount, people: 17 };
  const [counts, setCounts] = useState({ events: 0, resources: 0, locations: 0, people: 0 });
  const [lineIndex, setLineIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1800;
    let raf: number;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const progress = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts({
        events: Math.round(targets.events * eased),
        resources: Math.round(targets.resources * eased),
        locations: Math.round(targets.locations * eased),
        people: Math.round(targets.people * eased),
      });
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setFinished(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % SCAN_LINES.length);
    }, 550);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(
    () => [
      { label: "Events ingested", value: counts.events },
      { label: "Resources discovered", value: counts.resources },
      { label: "Locations mapped", value: counts.locations },
      { label: "People identified", value: counts.people },
    ],
    [counts]
  );

  const summary = firstSentence(description);

  return (
    <Step key="learn">
      <Eyebrow>Learning your business</Eyebrow>
      <Title>Give us a moment.</Title>
      <p className="mt-2 h-4 text-sm text-muted">{finished ? "Done — here's what Kloyya understands." : SCAN_LINES[lineIndex]}</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-surface p-3.5">
            <div className="text-xl font-semibold tabular-nums text-foreground">{s.value.toLocaleString()}</div>
            <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-3 rounded-md border border-accent/30 bg-accent/[0.06] p-3.5"
        >
          <div className="text-xs font-medium text-foreground">What Kloyya understands</div>
          <ul className="mt-2 flex flex-col gap-1.5 text-[11px] leading-relaxed text-muted">
            <li>
              <span className="text-foreground">{name}</span> — {industry || "business type not set"}
              {country ? ` · ${country}` : ""}
            </li>
            <li>
              Watching {connectedLabels.length} connected system{connectedLabels.length === 1 ? "" : "s"}
              {connectedLabels.length > 0 ? `: ${connectedLabels.join(", ")}` : ""}
            </li>
            {summary ? (
              <li>In your words: &ldquo;{summary}&rdquo;</li>
            ) : (
              <li>No description yet — Kloyya will keep learning as more systems connect.</li>
            )}
          </ul>
        </motion.div>
      )}

      <NextButton disabled={!finished} onClick={onDone} label={finished ? "Show me what needs attention" : "Scanning…"} />
    </Step>
  );
}
