import type { Transition, Variants } from "motion/react";

/**
 * The single easing curve for the entire app. Apple-style: fast out of the
 * gate, long gentle settle. Nothing in this codebase defines its own curve.
 */
export const EASE_IRIS = [0.32, 0.72, 0, 1] as const satisfies [
  number,
  number,
  number,
  number,
];

export const DUR = {
  fast: 0.18,
  base: 0.34,
  slow: 0.62,
  epic: 1.1,
} as const;

export const ease = (duration: number = DUR.base): Transition => ({
  duration,
  ease: EASE_IRIS,
});

/** Rise-and-fade. The default entrance for anything that isn't the aperture. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: ease(DUR.slow) },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: ease(DUR.slow) },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: ease(DUR.base) },
};

/** Parent wrapper: children enter in sequence. */
export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren, staggerChildren },
  },
});

/** Page-level transition used by every route under the app shell. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: ease(DUR.slow) },
  exit: { opacity: 0, y: -6, transition: ease(DUR.fast) },
};
