"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Fake token streaming, driven by rAF rather than an interval so it stays
 * locked to the compositor and doesn't stutter under load.
 *
 * With reduced motion the full text is present immediately and `onDone` fires
 * on the same tick — the demo still reaches its final state, just without the
 * theatre.
 */

export function StreamingText({
  text,
  charsPerSecond = 70,
  onDone,
  className,
  startDelay = 0,
}: {
  text: string;
  charsPerSecond?: number;
  onDone?: () => void;
  className?: string;
  startDelay?: number;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduced) {
      setShown(text.length);
      doneRef.current?.();
      return;
    }

    setShown(0);
    let raf = 0;
    let begun = 0;

    const tick = (t: number) => {
      if (!begun) begun = t + startDelay * 1000;
      const elapsed = Math.max(0, (t - begun) / 1000);
      const chars = Math.min(text.length, Math.floor(elapsed * charsPerSecond));
      setShown(chars);

      if (chars < text.length) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, charsPerSecond, reduced, startDelay]);

  const streaming = shown < text.length;
  const visible = text.slice(0, shown);
  const paragraphs = visible.split("\n\n");

  return (
    <div className={cn("space-y-4 text-[15px] leading-[1.7] text-paper/90", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p}
          {streaming && i === paragraphs.length - 1 && <Caret />}
        </p>
      ))}
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-[caret_1s_steps(2,start)_infinite] bg-iris-cyan"
    />
  );
}
