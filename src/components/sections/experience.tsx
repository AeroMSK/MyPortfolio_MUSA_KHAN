"use client";

import * as React from "react";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { experiences, type Experience } from "@/data/experience";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// EXPERIENCE SECTION — editorial vertical timeline
// Data-driven from @/data/experience (5 entries).
// Vertical line draws itself as user scrolls (useScroll + scaleY).
// Year labels slide in from left; bullets stagger in.
// Current roles get an animated pulsing acid dot + PRESENT label.
// ============================================================

const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
  smooth: [0.85, 0, 0.15, 1] as const,
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

// ---- Single timeline entry ----
function ExperienceEntry({
  exp,
  idx,
  prefersReducedMotion,
}: {
  exp: Experience;
  idx: number;
  prefersReducedMotion: boolean;
}) {
  const baseDelay = idx * 0.08;

  return (
    <motion.article
      aria-labelledby={`exp-${exp.id}-role`}
      className="relative grid grid-cols-12 gap-4 pl-10 md:gap-8 md:pl-16"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: EASE.expo,
        delay: prefersReducedMotion ? 0 : baseDelay,
      }}
    >
      {/* Marker dot on the line */}
      <motion.div
        className="absolute left-2 top-3 -translate-x-1/2"
        initial={prefersReducedMotion ? false : { scale: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE.expo,
          delay: prefersReducedMotion ? 0 : baseDelay + 0.2,
        }}
      >
        <div className="relative h-3 w-3">
          {/* Solid dot — always present */}
          <span className="absolute inset-0 rounded-full bg-acid" />
          {/* Outer pulse ring — only for current roles */}
          {exp.current && (
            <motion.span
              className="absolute -inset-[5px] rounded-full border border-acid/60"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: [1, 0.15, 1], scale: [1, 1.7, 1] }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 2.2,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </motion.div>

      {/* Year / period — slides in from left */}
      <motion.div
        className="col-span-12 mb-4 md:col-span-4 md:mb-0"
        initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.7,
          ease: EASE.expo,
          delay: prefersReducedMotion ? 0 : baseDelay + 0.05,
        }}
      >
        <p className="label-mono mb-3 flex items-center gap-2 text-ash">
          <Calendar className="h-3 w-3 text-acid" aria-hidden="true" />
          <span>PERIOD</span>
        </p>
        <h3
          className={cn(
            "font-display font-bold leading-[0.95] tracking-tightest",
            "text-[clamp(2rem,5vw,4rem)]",
            exp.current ? "text-paper" : "text-ash"
          )}
        >
          {exp.period}
        </h3>

        {exp.current && (
          <span className="label-mono mt-4 inline-flex items-center gap-2 text-acid">
            <span className="relative inline-block h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-acid" />
              <span
                className="absolute -inset-[3px] animate-ping rounded-full bg-acid/60"
                aria-hidden="true"
              />
            </span>
            PRESENT
          </span>
        )}
      </motion.div>

      {/* Content (role + org + location + bullets + tags) */}
      <div className="col-span-12 md:col-span-8">
        <div className="mb-4">
          <p className="label-mono mb-2 flex items-center gap-2 text-ash">
            <Briefcase className="h-3 w-3 text-acid" aria-hidden="true" />
            <span>
              ROLE · {exp.index}
            </span>
          </p>
          <h4
            id={`exp-${exp.id}-role`}
            className="font-display font-semibold leading-[1.1] tracking-tight text-paper text-[clamp(1.25rem,2.5vw,2rem)]"
          >
            {exp.role}
          </h4>
          <p className="label-mono mt-2 text-paper/80">{exp.organization}</p>
          {exp.location && (
            <p className="label-mono mt-1 flex items-center gap-1.5 text-ash">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span>{exp.location}</span>
            </p>
          )}
        </div>

        {/* Bullets with acid markers — stagger in */}
        <ul className="mt-4 space-y-3">
          {exp.description.map((desc, i) => (
            <motion.li
              key={i}
              className="flex gap-3 leading-relaxed text-paper/80"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                ease: EASE.expo,
                delay: prefersReducedMotion ? 0 : baseDelay + 0.3 + i * 0.1,
              }}
            >
              <span className="mt-1 select-none text-acid" aria-hidden="true">
                →
              </span>
              <span className="text-sm md:text-base">{desc}</span>
            </motion.li>
          ))}
        </ul>

        {/* Tags as small badges */}
        {exp.tags && exp.tags.length > 0 && (
          <motion.ul
            className="mt-6 flex flex-wrap gap-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              ease: EASE.expo,
              delay: prefersReducedMotion ? 0 : baseDelay + 0.5,
            }}
          >
            {exp.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-sm border border-border bg-graphite/40 px-2 py-1 font-mono text-[11px] tracking-[0.15em] uppercase text-paper/70"
              >
                {tag}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.article>
  );
}

// ---- Main section ----
export function ExperienceSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 50%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const entryCount = experiences.length;

  return (
    <section
      id="experience"
      className="relative scroll-mt-24 bg-steel px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-editorial">
        {/* Header */}
        <header className="mb-16 md:mb-24">
          {/* Top metadata strip */}
          <motion.div
            className="label-mono mb-8 flex flex-wrap items-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: EASE.expo }}
          >
            <span className="text-acid">003 / EXPERIENCE</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">TIMELINE</span>
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
            Experience
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
            An editorial timeline of roles, projects, and contributions.
          </motion.p>

          {/* Count / range strip */}
          <motion.div
            className="label-mono mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-4"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.3 }}
          >
            <span className="text-acid">
              {entryCount.toString().padStart(2, "0")} ENTRIES
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-ash">2023 — {siteConfig.year}</span>
            <span className="text-ash">·</span>
            <span className="text-ash">ROLES · PROJECTS · CONTRIBUTIONS</span>
          </motion.div>
        </header>

        {/* Timeline container */}
        <div ref={timelineRef} className="relative">
          {/* Static base line (full height, faint border color) */}
          <div
            className="absolute bottom-0 left-2 top-0 w-px bg-border"
            aria-hidden="true"
          />
          {/* Animated acid overlay — grows with scroll */}
          <motion.div
            className="absolute bottom-0 left-2 top-0 w-px origin-top bg-acid"
            style={{ scaleY: prefersReducedMotion ? 1 : lineHeight }}
            aria-hidden="true"
          />

          {/* Entries */}
          <div className="space-y-16 md:space-y-24">
            {experiences.map((exp, idx) => (
              <ExperienceEntry
                key={exp.id}
                exp={exp}
                idx={idx}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-24 border-t border-border pt-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / EXPERIENCE</span>
            <span className="text-acid">003 / 005</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
