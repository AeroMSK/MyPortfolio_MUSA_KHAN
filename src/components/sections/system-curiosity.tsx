"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Bug,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { curiosityItems, type CuriosityItem } from "@/data/technologies";
import { siteConfig } from "@/lib/config";

// ============================================================
// SYSTEM CURIOSITY — what I like to figure out
// 6 items rendered as a responsive 1/2/3-col grid.
// Each item: large label + small description + lucide icon.
// Hover: subtle acid border appears, label color shifts to acid.
// Tone: curious, technical, experimental — NOT "hacker".
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

// ---- Per-item icon mapping (one lucide icon per curiosity) ----
// Stored as pre-rendered React elements at module load time so the
// react-hooks/static-components rule doesn't flag a component lookup
// during render. The className uses group-hover so hover-state styles
// still work via CSS cascade.
const ICON_CLASS =
  "h-4 w-4 text-acid/70 transition-colors duration-300 group-hover:text-acid";

const ICON_ELEMENTS: Record<string, React.ReactElement> = {
  debugging: <Bug className={ICON_CLASS} aria-hidden="true" />,
  "system-behavior": <Activity className={ICON_CLASS} aria-hidden="true" />,
  "edge-cases": <Sparkles className={ICON_CLASS} aria-hidden="true" />,
  "security-concepts": <Shield className={ICON_CLASS} aria-hidden="true" />,
  "digital-investigation": <Search className={ICON_CLASS} aria-hidden="true" />,
  "failure-analysis": <Brain className={ICON_CLASS} aria-hidden="true" />,
};

const DEFAULT_ICON_ELEMENT: React.ReactElement = (
  <Search className={ICON_CLASS} aria-hidden="true" />
);

function iconFor(id: string): React.ReactElement {
  return ICON_ELEMENTS[id] ?? DEFAULT_ICON_ELEMENT;
}

// ---- Single curiosity item ----
function CuriosityCard({
  item,
  idx,
  prefersReducedMotion,
}: {
  item: CuriosityItem;
  idx: number;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.article
      aria-labelledby={`curiosity-${item.id}-label`}
      className="group relative border border-border bg-graphite/40 px-6 py-8 transition-all duration-300 hover:border-acid/50 hover:bg-graphite/70 md:px-8 md:py-10"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : idx * 0.08,
      }}
    >
      {/* Top row: index + icon */}
      <div className="mb-6 flex items-center justify-between">
        <span className="label-mono text-ash">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-ink/40 transition-colors duration-300 group-hover:border-acid/50 group-hover:bg-acid/10">
          {iconFor(item.id)}
        </span>
      </div>

      {/* Label */}
      <h3
        id={`curiosity-${item.id}-label`}
        className="font-display font-semibold leading-tight tracking-tight text-paper transition-colors duration-300 group-hover:text-acid text-[clamp(1.25rem,2.5vw,1.75rem)]"
      >
        {item.label}
      </h3>

      {/* Description */}
      <p className="mt-3 max-w-prose font-sans text-sm leading-relaxed text-ash md:text-base">
        {item.description}
      </p>

      {/* Subtle corner accent — appears on hover */}
      <span
        className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-acid opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-acid opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </motion.article>
  );
}

// ---- Main section ----
export function SystemCuriositySection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <section
      id="system-curiosity"
      className="relative scroll-mt-24 bg-ink px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-editorial">
        {/* Section header */}
        <header className="mb-12 md:mb-20">
          {/* Top metadata strip */}
          <motion.div
            className="label-mono mb-8 flex flex-wrap items-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE.expo }}
          >
            <span className="text-acid">SYSTEM CURIOSITY</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">THINGS I LIKE TO FIGURE OUT</span>
            <span className="ml-auto text-ash">{siteConfig.year}</span>
          </motion.div>

          {/* Big title */}
          <motion.h2
            className="text-display-md font-display font-bold uppercase leading-[0.9] tracking-tightest text-paper"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              ease: EASE.expo,
              delay: 0.1,
            }}
          >
            Curiosity
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-prose font-sans text-base text-ash md:text-lg"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: EASE.expo,
              delay: 0.2,
            }}
          >
            A subtle look at how I investigate systems, edge cases, and unusual
            behavior.
          </motion.p>

          {/* Count strip */}
          <motion.div
            className="label-mono mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-4"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.3 }}
          >
            <span className="text-acid">
              {curiosityItems.length.toString().padStart(2, "0")} THREADS
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-ash">DEBUG · INVESTIGATE · UNDERSTAND</span>
          </motion.div>
        </header>

        {/* Curiosity grid — 1 col mobile / 2 col tablet / 3 col desktop */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {curiosityItems.map((item, idx) => (
            <CuriosityCard
              key={item.id}
              item={item}
              idx={idx}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-16 border-t border-border pt-6 md:mt-24"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / SYSTEM CURIOSITY</span>
            <span className="text-acid">— / —</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
