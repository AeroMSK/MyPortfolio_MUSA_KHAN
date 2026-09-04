"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { techGroups, type Tech } from "@/data/technologies";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// TECH STACK SECTION — tools, languages, frameworks
// Data-driven from @/data/technologies (4 groups, ~29 techs).
// Cards stagger in on scroll, group headers slide from left.
// Marquee strip below: two rows of all icons scrolling opposite directions.
// No progress bars / no percentages — only status labels.
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

// ---- Status badge styling (acid-tinted, mono) ----
const STATUS_STYLES: Record<Tech["status"], string> = {
  "USED": "border-acid/40 bg-acid/10 text-acid",
  "BUILDING WITH": "border-acid/60 bg-acid/15 text-acid",
  "EXPERIENCE": "border-border bg-graphite/60 text-paper/70",
  "WORKFLOW": "border-border bg-iron/60 text-ash",
};

// ---- All techs flattened (for the marquee strip) ----
const ALL_TECHS: Tech[] = techGroups.flatMap((g) => g.techs);

// ---- Single tech card ----
function TechCard({
  tech,
  idx,
  prefersReducedMotion,
}: {
  tech: Tech;
  idx: number;
  prefersReducedMotion: boolean;
}) {
  const baseDelay = idx * 0.05;

  return (
    <motion.article
      aria-label={tech.name}
      className={cn(
        "group relative flex flex-col items-start gap-3 border border-border bg-graphite/40 p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:border-acid/50 hover:bg-graphite/70"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : baseDelay,
      }}
    >
      {/* Icon — external Iconify SVG via <img> */}
      <div
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-border bg-ink/40 p-2 transition-all duration-300 group-hover:scale-110 group-hover:border-acid/40"
        aria-hidden="true"
      >
        { }
        <img
          src={tech.icon}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          className="h-full w-full object-contain [filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(180deg)_brightness(1.1)] transition-opacity group-hover:[filter:none] dark:[filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(180deg)_brightness(1.1)]"
        />
      </div>

      {/* Name */}
      <h3 className="font-display text-base font-semibold leading-tight tracking-tight text-paper md:text-lg">
        {tech.name}
      </h3>

      {/* Status badge */}
      <span
        className={cn(
          "mt-auto inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] uppercase",
          STATUS_STYLES[tech.status]
        )}
      >
        {tech.status}
      </span>
    </motion.article>
  );
}

// ---- Tech group block ----
function TechGroup({
  group,
  groupIdx,
  prefersReducedMotion,
}: {
  group: (typeof techGroups)[number];
  groupIdx: number;
  prefersReducedMotion: boolean;
}) {
  // running card index for global stagger (across all groups)
  const cardsBefore = techGroups
    .slice(0, groupIdx)
    .reduce((sum, g) => sum + g.techs.length, 0);

  return (
    <div className="border-t border-border pt-8 md:pt-12">
      {/* Group header — slides in from left */}
      <motion.div
        className="mb-6 flex items-baseline gap-4 md:mb-8"
        initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.7,
          ease: EASE.expo,
        }}
      >
        <span className="label-mono text-acid">{group.index}</span>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-paper md:text-3xl">
          {group.label}
        </h3>
        <span className="label-mono ml-auto text-ash">
          {group.techs.length.toString().padStart(2, "0")} ITEMS
        </span>
      </motion.div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {group.techs.map((tech, i) => (
          <TechCard
            key={`${group.id}-${tech.name}`}
            tech={tech}
            idx={cardsBefore + i}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Marquee strip (two rows scrolling opposite directions) ----
function MarqueeStrip({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const row = ALL_TECHS;
  const duplicated = [...row, ...row];

  const animClass = prefersReducedMotion
    ? ""
    : "animate-marquee-left";
  const animClassReverse = prefersReducedMotion
    ? ""
    : "animate-marquee-right";

  return (
    <div
      className="mt-20 border-y border-border py-8 md:mt-28 md:py-10"
      aria-hidden="true"
    >
      <div className="relative flex overflow-hidden">
        {/* Fade masks on edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-slate-deep to-transparent md:w-32" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-slate-deep to-transparent md:w-32" />

        <div className={cn("flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16", animClass)}>
          {duplicated.map((tech, i) => (
            <div
              key={`m1-${i}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center opacity-40 transition-opacity hover:opacity-100 md:h-12 md:w-12"
            >
              { }
              <img
                src={tech.icon}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="h-full w-full object-contain [filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(180deg)_brightness(1.1)]"
              />
            </div>
          ))}
        </div>

        <div className={cn("flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16", animClassReverse)} aria-hidden="true">
          {duplicated.map((tech, i) => (
            <div
              key={`m2-${i}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center opacity-40 transition-opacity hover:opacity-100 md:h-12 md:w-12"
            >
              { }
              <img
                src={tech.icon}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="h-full w-full object-contain [filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(180deg)_brightness(1.1)]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Main section ----
export function TechStackSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const totalTechs = ALL_TECHS.length;

  return (
    <section
      id="stack"
      className="relative scroll-mt-24 bg-slate-deep px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-editorial">
        {/* Header */}
        <header className="mb-16 md:mb-24">
          <motion.div
            className="label-mono mb-8 flex flex-wrap items-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE.expo }}
          >
            <span className="text-acid">004 / STACK</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">TECH EXPERIENCE</span>
            <span className="ml-auto text-ash">{siteConfig.year}</span>
          </motion.div>

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
            Tech Experience
          </motion.h2>

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
            Tools, languages, and frameworks I work with across web, mobile, and modern systems.
          </motion.p>

          <motion.div
            className="label-mono mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-4"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.3 }}
          >
            <span className="text-acid">
              {totalTechs.toString().padStart(2, "0")} TOOLS
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-ash">{techGroups.length} GROUPS</span>
            <span className="text-ash">·</span>
            <span className="text-ash">LANGUAGES · FRONTEND · BACKEND · TOOLS</span>
          </motion.div>
        </header>

        {/* Groups */}
        <div className="space-y-12 md:space-y-20">
          {techGroups.map((group, idx) => (
            <TechGroup
              key={group.id}
              group={group}
              groupIdx={idx}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Marquee strip */}
        <MarqueeStrip prefersReducedMotion={prefersReducedMotion} />

        {/* Footer */}
        <motion.footer
          className="mt-12 border-t border-border pt-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / STACK</span>
            <span className="text-acid">004 / 006</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
