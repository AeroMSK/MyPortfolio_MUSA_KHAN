"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================
// ScrollReveal
// Reusable scroll-triggered reveal wrapper.
// Fades + slides children into view via whileInView.
// ============================================================

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Delay (seconds) before the reveal animation starts */
  delay?: number;
  /** Initial Y offset in px (default 30) */
  y?: number;
  /** Reveal only once vs. on every enter (default true) */
  once?: boolean;
  /** Viewport amount that must be visible to trigger (default 0.2) */
  amount?: number;
  /** Custom className applied to the motion wrapper */
  className?: string;
  /** Tag for the motion wrapper (default "div") */
  as?: "div" | "section" | "article" | "ul" | "li" | "span" | "header";
  /** Custom duration in seconds (default 0.7) */
  duration?: number;
}

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const motionTagMap = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  li: motion.li,
  span: motion.span,
  header: motion.header,
} as const;

export function ScrollReveal({
  children,
  delay = 0,
  y = 30,
  once = true,
  amount = 0.2,
  className,
  as = "div",
  duration = 0.7,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motionTagMap[as];

  // Reduced motion: render the plain tag (no transform, fully visible)
  if (prefersReducedMotion) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_EXPO, delay },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  );
}
