"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { creativeCategories, type CreativeCategory } from "@/data/technologies";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// BEYOND CODE — creative categories
// 5 categories rendered as alternating editorial rows.
// Each row: index | big label | items (small badges).
// Hover: row bg shifts, items slide right.
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

// ---- Single category row ----
function CategoryRow({
  category,
  idx,
  prefersReducedMotion,
}: {
  category: CreativeCategory;
  idx: number;
  prefersReducedMotion: boolean;
}) {
  // Alternate row tones — even rows keep bg-graphite, odd rows get a subtle slate-deep wash
  const isAlt = idx % 2 === 1;

  return (
    <motion.article
      aria-labelledby={`beyond-${category.id}-label`}
      className={cn(
        "group relative grid grid-cols-12 gap-3 border-t border-border px-2 py-8 transition-colors duration-300 md:gap-6 md:px-6 md:py-12",
        isAlt ? "bg-slate-deep/30" : "bg-graphite",
        "hover:bg-iron/40"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : idx * 0.08,
      }}
    >
      {/* Index */}
      <div className="col-span-2 flex items-start md:col-span-1">
        <span className="label-mono text-acid">{category.index}</span>
      </div>

      {/* Big category label */}
      <div className="col-span-10 flex items-start md:col-span-5">
        <h3
          id={`beyond-${category.id}-label`}
          className={cn(
            "font-display font-semibold uppercase leading-[1.05] tracking-tight text-paper transition-colors duration-300 group-hover:text-acid",
            "text-[clamp(1.5rem,4vw,3rem)]"
          )}
        >
          {category.label}
        </h3>
      </div>

      {/* Items as small badges */}
      <ul
        className="col-span-12 flex flex-wrap items-center gap-2 md:col-span-6"
        aria-label={`${category.label} — items`}
      >
        {category.items.map((item, i) => (
          <li
            key={item}
            className={cn(
              "rounded-sm border border-border bg-graphite/60 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.15em] uppercase text-paper/70 transition-all duration-300",
              "group-hover:border-acid/40 group-hover:text-paper group-hover:translate-x-1"
            )}
            style={{
              transitionDelay: prefersReducedMotion ? "0ms" : `${i * 30}ms`,
            }}
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Hover arrow — appears on hover */}
      <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
        <ArrowUpRight className="h-5 w-5 text-acid" aria-hidden="true" />
      </div>
    </motion.article>
  );
}

// ---- Main section ----
export function BeyondCodeSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <section
      id="beyond-code"
      className="relative scroll-mt-24 bg-graphite px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
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
            <span className="text-acid">BEYOND CODE</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">OTHER THINGS I MAKE</span>
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
            Beyond Code
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
            Creative disciplines that shape how I build &mdash; motion, sound,
            design, and the experiments that live alongside the engineering.
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
              {creativeCategories.length.toString().padStart(2, "0")} CATEGORIES
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-ash">CREATIVE · TECHNICAL · EXPERIMENTAL</span>
          </motion.div>
        </header>

        {/* Category rows */}
        <div className="border-b border-border">
          {creativeCategories.map((category, idx) => (
            <CategoryRow
              key={category.id}
              category={category}
              idx={idx}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-10"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / BEYOND CODE</span>
            <span className="text-acid">— / —</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
