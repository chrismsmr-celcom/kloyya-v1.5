"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, FlaskConical, RotateCcw } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { SourceIcon } from "@/components/source-chip";
import { Button } from "@/components/ui/button";
import { AUTH_IS_MOCKED } from "@/lib/auth";
import { company, connectors, founder } from "@/lib/demo-data";
import { fadeUp, stagger } from "@/lib/motion";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * What is scripted is stated here, in the product, in plain language. The demo
 * is allowed to be a demo; it is not allowed to imply it is more than one.
 */
const MOCKED = [
  "Authentication — no auth server; any credentials sign you in",
  "Gmail, Calendar and Notion — no OAuth, no account is ever read",
  "Every AI answer, brief and risk — written in advance, not generated",
  "All metrics, threads, events and documents — fictional",
];

const REAL = [
  "The interface, animation and state machine",
  "The knowledge graph rendering and layout",
  "The command palette and keyboard navigation",
];

export default function SettingsPage() {
  const router = useRouter();
  const connected = useDemo((s) => s.connected);
  const reset = useDemo((s) => s.reset);

  return (
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl"
    >
      <motion.header variants={fadeUp} className="mb-7">
        <h1 className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
          Settings
        </h1>
      </motion.header>

      {/* The disclosure, first — not buried at the bottom. */}
      <GlassCard className="border-iris-violet/25">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-iris-violet/30 bg-iris-violet/10">
            <FlaskConical className="size-4 text-iris-violet" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[17px] font-semibold text-paper">
              You are looking at a prototype
            </h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-paper-dim">
              Kloyya&apos;s interface is real. Its backend is not. Nothing here
              connects to a live account, and no answer on any screen was
              generated at the moment you read it.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <SectionTitle className="!text-signal">Simulated</SectionTitle>
                <ul className="mt-2.5 space-y-2">
                  {MOCKED.map((m) => (
                    <li key={m} className="flex gap-2 text-[13px] leading-relaxed text-paper-dim">
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-signal/70" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <SectionTitle>Actually built</SectionTitle>
                <ul className="mt-2.5 space-y-2">
                  {REAL.map((m) => (
                    <li key={m} className="flex gap-2 text-[13px] leading-relaxed text-paper-dim">
                      <Check className="mt-[3px] size-3 shrink-0 text-iris-cyan" strokeWidth={3} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <GlassCard>
          <SectionTitle className="mb-4">Account</SectionTitle>
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-iris-violet to-iris-blue text-[14px] font-semibold text-white">
              {founder.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-paper">
                {founder.name}
              </p>
              <p className="truncate font-mono text-[11px] text-paper-faint">
                {founder.email}
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 border-t border-hairline pt-4 text-[13px]">
            <Row label="Workspace" value={company.name} />
            <Row label="Role" value={founder.role} />
            <Row
              label="Auth provider"
              value={AUTH_IS_MOCKED ? "Supabase (stubbed)" : "Supabase"}
            />
          </dl>
        </GlassCard>

        <GlassCard>
          <SectionTitle className="mb-4">Sources</SectionTitle>
          <ul className="space-y-3">
            {connectors.map((c) => {
              const on = connected[c.id];
              return (
                <li key={c.id} className="flex items-center gap-3">
                  <SourceIcon
                    id={c.id}
                    className={cn(
                      "size-4 shrink-0",
                      on ? "text-iris-cyan" : "text-paper-faint",
                    )}
                  />
                  <span className="flex-1 text-[14px] text-paper">{c.name}</span>
                  <span
                    className={cn(
                      "font-mono text-[11px]",
                      on ? "text-paper-dim" : "text-paper-faint",
                    )}
                  >
                    {on ? `${c.itemCount.toLocaleString()} items` : "Not connected"}
                  </span>
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      on ? "bg-iris-cyan" : "bg-white/15",
                    )}
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-hairline pt-4">
            <p className="text-[13px] leading-relaxed text-paper-dim">
              Reset returns the demo to a signed-out, unconnected state.
            </p>
            <Button
              variant="glass"
              size="sm"
              className="mt-3.5 w-full"
              onClick={() => {
                reset();
                router.push("/");
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset demo
            </Button>
          </div>
        </GlassCard>
      </div>

      <motion.div variants={fadeUp}>
        <GlassCard className="mt-4">
          <SectionTitle className="mb-4">Appearance</SectionTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-paper">Theme</p>
              <p className="mt-0.5 text-[13px] text-paper-dim">
                Kloyya is built for dark rooms and late nights. Light mode is
                not in this prototype.
              </p>
            </div>
            <span className="chip shrink-0">dark</span>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-paper-faint">{label}</dt>
      <dd className="truncate text-paper-dim">{value}</dd>
    </div>
  );
}
