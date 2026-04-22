import type { Transition, Variants } from 'motion/react';
import { useReducedMotion } from 'motion/react';

export const spring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 22,
};

const pinnedSpring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 18,
};

const fallEase: Transition = {
  duration: 0.28,
  ease: [0.4, 0.0, 0.9, 0.4],
};

export const pinnedEnter: Variants = {
  initial: { scale: 1.4, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: pinnedSpring },
  exit: { y: 60, rotate: 4, opacity: 0, transition: fallEase },
};

export const pinnedExit: Variants = pinnedEnter;

export const tossedEnter: Variants = {
  initial: { y: 50, rotate: -3, opacity: 0 },
  animate: { y: 0, rotate: 0, opacity: 1, transition: spring },
  exit: { y: 60, rotate: 4, opacity: 0, transition: fallEase },
};

export const tossedExit: Variants = tossedEnter;

const fadeOnly: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export interface MotionVariants {
  pinned: Variants;
  tossed: Variants;
  reduced: boolean;
}

export function useMotionVariants(): MotionVariants {
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    return { pinned: fadeOnly, tossed: fadeOnly, reduced: true };
  }
  return { pinned: pinnedEnter, tossed: tossedEnter, reduced: false };
}
