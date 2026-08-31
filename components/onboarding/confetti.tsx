"use client";

import { useMemo } from "react";

const COLORS = ["#4f7cff", "#3fb87f", "#d6a13b"];

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotate: number;
  drift: number;
};

// Kept outside the component so the randomness isn't treated as a render-impure call.
function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.6 + Math.random() * 0.9,
    size: 5 + Math.random() * 5,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
  }));
}

export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(() => generateConfetti(count), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // @ts-expect-error custom property consumed by the keyframe below
            "--drift": `${p.drift}px`,
            "--rotate": `${p.rotate}deg`,
          }}
          className="confetti-piece absolute top-0 rounded-sm opacity-0"
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.2, 0.6, 0.3, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translate(0, -10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--drift), 340px) rotate(var(--rotate));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
