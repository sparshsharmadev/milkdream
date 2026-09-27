/**
 * Motion Intent: Centralized animation configurations conforming strictly to design.md.
 * - Micro-interactions: 150-250ms spring (stiffness: 300, damping: 25)
 * - Transitions: 300-500ms ease: [0.25, 0.1, 0.25, 1]
 * - Stagger: 60ms
 * - Modals: 300ms easeOut entrance, 200ms easeIn exit
 * - Animates ONLY transform and opacity for 60fps performance.
 */

import { Variants, Transition } from "framer-motion";

// Standard Easing curves
export const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;
export const EASE_IN = [0.42, 0, 1, 1] as const;

// Interactive Spring (buttons, active cards)
export const INTERACTIVE_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

// Page / Section Entrance: opacity: 0 -> 1, y: 20 -> 0, 400ms easeOut
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.25,
      ease: EASE_IN,
    },
  },
};

// Container Choreography with 60ms stagger
export const containerStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Cards / List Items Entrance: y: 16 -> 0, 350ms, hover: scale 1.02, y: -2
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.25,
      ease: EASE_IN,
    },
  },
};

// Interactive Card Hover Props
export const cardHoverMotion = {
  whileHover: {
    scale: 1.02,
    y: -2,
    transition: INTERACTIVE_SPRING,
  },
  whileTap: {
    scale: 0.98,
    transition: INTERACTIVE_SPRING,
  },
};

// Button Interaction: hover scale: 1.05 (150ms spring), press scale: 0.97
export const buttonMotion = {
  whileHover: {
    scale: 1.05,
    transition: { type: "spring" as const, stiffness: 350, damping: 20 },
  },
  whileTap: {
    scale: 0.97,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
};


// Modals: opacity: 0 -> 1, scale: 0.95 -> 1, 300ms easeOut; Exit reverse 200ms easeIn
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: EASE_IN,
    },
  },
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
