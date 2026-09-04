"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

// ============================================================
// ScrollProgress
// Thin (2px) fixed acid progress bar at the top of the viewport
// that fills as the user scrolls down the page.
// ============================================================

export function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Spring smoothing for premium feel
  const springConfig = {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  };
  const scaleX = useSpring(scrollYProgress, springConfig);

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-acid"
      style={{
        scaleX: prefersReducedMotion ? scrollYProgress : scaleX,
      }}
    />
  );
}
