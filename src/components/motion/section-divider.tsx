"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================
// SectionDivider
// Reusable transition between sections: drawing horizontal line
// + sliding index/label typography. Place at the top of a section.
// ============================================================

export interface SectionDividerProps {
  /** Editorial index, e.g. "003" */
  index: string;
  /** Section label, e.g. "Experience" */
  label: string;
  className?: string;
}

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function SectionDivider({
  index,
  label,
  className,
}: SectionDividerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("w-full", className)}>
      {/* Top: drawing horizontal line — scaleX 0 → 1 from left */}
      <motion.div
        aria-hidden
        className="h-px w-full origin-left bg-border"
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          ease: EASE_EXPO,
        }}
      />

      {/* Below: index + label, both sliding in */}
      <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:gap-x-6">
        <motion.span
          className="label-mono text-acid"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: EASE_EXPO,
            delay: 0.2,
          }}
        >
          {index}
        </motion.span>

        <motion.span
          aria-hidden
          className="hidden text-ash/40 sm:inline"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: EASE_EXPO,
            delay: 0.25,
          }}
        >
          /
        </motion.span>

        <motion.h2
          className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold uppercase tracking-tight text-paper"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: EASE_EXPO,
            delay: 0.3,
          }}
        >
          {label}
        </motion.h2>
      </div>
    </div>
  );
}
