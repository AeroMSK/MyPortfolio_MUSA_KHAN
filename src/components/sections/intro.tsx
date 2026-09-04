"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { TextReveal } from "@/components/motion/text-reveal";

// ============================================================
// Intro / Positioning Section — Vertical-style statement block
// Per-character scroll-driven color transition on heading (gray → paper)
// as user scrolls past, exactly like vertical.framer.media.
// ============================================================

const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
};

// ---- Reduced motion (SSR-safe) ----
function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// ---- Heading lines (Vertical-style: each line is one TextReveal block) ----
// The heading is split across 3 separate TextReveal blocks (one per line)
// so each line transitions independently as the user scrolls past it.
const HEADING_LINES: Array<{ text: string; acidWords?: string[] }> = [
  { text: "I BUILD DIGITAL SYSTEMS" },
  { text: "THAT FEEL AS GOOD AS" },
  { text: "THEY FUNCTION.", acidWords: ["FUNCTION."] },
];

// ---- Intro Section ----
export function IntroSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <section className="relative border-t border-border bg-ink px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-editorial">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          {/* Left column: metadata (4 cols) */}
          <motion.div
            className="col-span-12 md:col-span-4"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: EASE.expo,
            }}
          >
            <div className="label-mono space-y-2">
              <div className="text-acid">002 / INTRO</div>
              <div className="text-ash">POSITIONING</div>
              <div className="text-ash">{siteConfig.year}</div>
            </div>
          </motion.div>

          {/* Right column: heading + paragraph (8 cols) */}
          <div className="col-span-12 md:col-span-8">
            <h2 className="font-display font-semibold tracking-tight text-[clamp(2rem,6vw,5rem)] leading-[1.05]">
              {HEADING_LINES.map((line, lineIdx) => (
                <span key={lineIdx} className="block">
                  <TextReveal
                    text={line.text}
                    as="span"
                    mode="char"
                    className="font-display font-semibold tracking-tight text-[clamp(2rem,6vw,5rem)] leading-[1.05]"
                  />
                </span>
              ))}
            </h2>

            <motion.p
              className="mt-10 max-w-prose space-y-4 font-sans text-base leading-relaxed text-paper/80 md:text-lg"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.7,
                ease: EASE.expo,
                delay: 0.2,
              }}
            >
              <span className="block">
                I am a Computer Science and Engineering student at International Islamic
                University Chittagong. I work across software development, machine-learning
                research, and modern creative systems — building practical products and
                publishing research side by side.
              </span>
              <span className="block">
                I enjoy working where engineering meets design and research meets craft —
                turning ideas into useful, functional, and visually thoughtful experiences.
              </span>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
