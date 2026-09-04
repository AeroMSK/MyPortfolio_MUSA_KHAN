"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers, GraduationCap } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { TextReveal } from "@/components/motion/text-reveal";

// ============================================================
// ABOUT SECTION — Vertical-style identity statement
// Per-character scroll-driven color transition on heading lines
// (gray → paper) as user scrolls past, exactly like vertical.framer.media.
// Acid-highlighted words ("RESEARCH", "FUNCTION.") render in acid color
// on top of the TextReveal base.
// ============================================================

const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
};

// ---- Reduced motion (SSR-safe via useSyncExternalStore) ----
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

// ---- Heading statement (intentional line breaks) ----
const HEADING_LINES: string[] = [
  "I BUILD SOFTWARE AND RESEARCH SYSTEMS",
  "THAT FEEL AS GOOD AS",
  "THEY FUNCTION.",
];

// ---- Metadata grid items ----
const METADATA = [
  {
    label: "BASED IN",
    icon: MapPin,
    value: siteConfig.location,
  },
  {
    label: "FOCUS",
    icon: Layers,
    value: "Software · Research · Creative",
  },
  {
    label: "STUDY",
    icon: GraduationCap,
    value: "CSE @ IIUC, 7th Semester",
  },
] as const;

// ---- About Section ----
export function AboutSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <section
      id="about"
      className="relative scroll-mt-24 bg-charcoal px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-editorial">
        {/* Section header */}
        <motion.header
          className="label-mono mb-12 flex flex-wrap items-center gap-3 md:mb-20"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE.expo }}
        >
          <span className="text-acid">005 / ABOUT</span>
          <span className="h-px w-8 bg-border" aria-hidden="true" />
          <span className="text-ash">IDENTITY</span>
          <span className="ml-auto text-ash">{siteConfig.year}</span>
        </motion.header>

        {/* Big typography statement — per-character scroll color transition */}
        <h2 className="font-display font-semibold leading-[1.1] tracking-tight">
          {HEADING_LINES.map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              <TextReveal
                text={line}
                as="span"
                mode="char"
                className="font-display font-semibold leading-[1.1] tracking-tight text-[clamp(1.5rem,4.5vw,3.5rem)]"
              />
            </span>
          ))}
        </h2>

        {/* Supporting paragraphs */}
        <motion.div
          className="mt-12 max-w-prose space-y-4 font-sans text-base leading-relaxed text-paper/80 md:mt-16 md:text-lg"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: EASE.expo,
            delay: 0.45,
          }}
        >
          <p>
            I&rsquo;m a Computer Science and Engineering student at IIUC. I build software
            across web, mobile, and modern systems &mdash; and I research machine learning,
            explainability, and applied AI on the academic side. My work lives between
            engineering, research, and creative practice.
          </p>
          <p>
            Beyond code: motion, sound, design, and a steady curiosity for how systems
            behave under unusual conditions.
          </p>
        </motion.div>

        {/* Metadata grid */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 border-t border-border pt-10 sm:grid-cols-2 md:grid-cols-3 md:mt-24"
          initial="hidden"
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.12,
                delayChildren: prefersReducedMotion ? 0 : 0.2,
              },
            },
          }}
        >
          {METADATA.map(({ label, icon: Icon, value }) => (
            <motion.div
              key={label}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: prefersReducedMotion ? 0 : 0.55,
                    ease: EASE.expo,
                  },
                },
              }}
              className="group relative border-l border-border pl-4 md:pl-6"
            >
              <p className="label-mono flex items-center gap-2 text-ash">
                <Icon className="h-3 w-3 text-acid" aria-hidden="true" />
                <span>{label}</span>
              </p>
              <p className="mt-3 font-display text-lg leading-snug tracking-tight text-paper md:text-xl">
                {value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
