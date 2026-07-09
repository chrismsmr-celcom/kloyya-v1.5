"use client";

import { cn } from "@/lib/utils";

/**
 * The fourth use of the aperture: a slow conic sweep, as if the iris were
 * turning behind frosted glass. Rotating a transform, not animating a
 * background-position, so it composites on the GPU.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-white/[0.035]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute -inset-[60%] animate-[iris-sweep_2.4s_linear_infinite] motion-reduce:animate-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(124,92,255,0.20) 38deg, rgba(56,189,248,0.10) 68deg, transparent 96deg)",
        }}
      />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5 rounded-md", i === lines - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass space-y-4 p-5">
      <Skeleton className="h-3.5 w-24 rounded-md" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-28 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
    </div>
  );
}
