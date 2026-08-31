"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Small shared building blocks for each onboarding step. Kept tiny and dumb on
// purpose — all the state and logic lives in app/onboarding/page.tsx.

export function Step({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium uppercase tracking-wider text-muted">{children}</div>;
}

export function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("mt-1 text-2xl font-semibold tracking-tight", className)}>{children}</h1>;
}

export function NextButton({
  onClick,
  disabled,
  label = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-accent/85 disabled:opacity-40"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </button>
  );
}
