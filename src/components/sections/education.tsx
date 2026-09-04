"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Calendar, BookOpen } from "lucide-react";
import { education, activities, type Education } from "@/data/experience";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// ============================================================
// EDUCATION SECTION — academic timeline + workshops/activities
// Data-driven from @/data/experience (3 entries + 6 activities).
// Distinct vertical timeline (book + cap motif) + activities grid.
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

// ---- Education timeline entry ----
function EducationEntry({
  edu,
  idx,
  prefersReducedMotion,
}: {
  edu: Education;
  idx: number;
  prefersReducedMotion: boolean;
}) {
  const baseDelay = idx * 0.1;

  return (
    <motion.article
      aria-labelledby={`edu-${edu.id}-inst`}
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
      {/* Marker — square (academic vs. round experience dots) */}
      <motion.div
        className="absolute left-2 top-2 -translate-x-1/2"
        initial={prefersReducedMotion ? false : { scale: 0, rotate: -45 }}
        whileInView={prefersReducedMotion ? undefined : { scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE.expo,
          delay: prefersReducedMotion ? 0 : baseDelay + 0.2,
        }}
      >
        <div className="relative h-3.5 w-3.5">
          <span
            className={cn(
              "absolute inset-0 rotate-45 rounded-[2px]",
              edu.current ? "bg-acid" : "bg-ash"
            )}
          />
          {edu.current && (
            <motion.span
              className="absolute -inset-[6px] rotate-45 rounded-[3px] border border-acid/60"
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

      {/* Period (big year) */}
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
            "text-[clamp(1.75rem,4.5vw,3rem)]",
            edu.current ? "text-paper" : "text-ash"
          )}
        >
          {edu.period}
        </h3>

        {edu.current && (
          <span className="label-mono mt-4 inline-flex items-center gap-2 text-acid">
            <span className="relative inline-block h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-acid" />
              <span
                className="absolute -inset-[3px] animate-ping rounded-full bg-acid/60"
                aria-hidden="true"
              />
            </span>
            CURRENT
          </span>
        )}
      </motion.div>

      {/* Institution + degree + detail */}
      <div className="col-span-12 md:col-span-8">
        <div className="mb-3">
          <p className="label-mono mb-2 flex items-center gap-2 text-ash">
            <GraduationCap className="h-3 w-3 text-acid" aria-hidden="true" />
            <span>INSTITUTION · {String(idx + 1).padStart(2, "0")}</span>
          </p>
          <h4
            id={`edu-${edu.id}-inst`}
            className="font-display font-semibold leading-[1.15] tracking-tight text-paper text-[clamp(1.25rem,2.5vw,2rem)]"
          >
            {edu.institution}
          </h4>
        </div>

        <p className="mt-3 font-display text-base font-medium text-paper/80 md:text-lg">
          {edu.degree}
        </p>
        <p className="label-mono mt-3 text-ash">{edu.detail}</p>
      </div>
    </motion.article>
  );
}

// ---- Activity card ----
function ActivityCard({
  activity,
  idx,
  prefersReducedMotion,
}: {
  activity: (typeof activities)[number];
  idx: number;
  prefersReducedMotion: boolean;
}) {
  const baseDelay = idx * 0.06;

  return (
    <motion.article
      aria-labelledby={`act-${activity.id}-title`}
      className={cn(
        "group relative border border-border bg-graphite/40 p-5 transition-all duration-300",
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
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-ink/40 text-acid transition-all duration-300 group-hover:border-acid/50 group-hover:bg-acid/10">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="label-mono rounded-sm border border-border bg-iron/60 px-2 py-0.5 text-ash">
          {activity.period}
        </span>
      </div>

      <h4
        id={`act-${activity.id}-title`}
        className="mt-4 font-display text-base font-medium leading-tight tracking-tight text-paper transition-colors duration-300 group-hover:text-acid md:text-lg"
      >
        {activity.title}
      </h4>
      <p className="mt-2 font-sans text-sm leading-relaxed text-ash md:text-[0.95rem]">
        {activity.detail}
      </p>
    </motion.article>
  );
}

// ---- Main section ----
export function EducationSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const timelineRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 50%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="education"
      className="relative scroll-mt-24 bg-iron px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40"
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
            <span className="text-acid">005A / EDUCATION</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span className="text-ash">ACADEMIC</span>
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
            Education
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
            Academic background and workshops.
          </motion.p>
        </header>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mb-24 md:mb-32">
          <div
            className="absolute bottom-0 left-2 top-0 w-px bg-border"
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-0 left-2 top-0 w-px origin-top bg-acid"
            style={{ scaleY: prefersReducedMotion ? 1 : lineHeight }}
            aria-hidden="true"
          />

          <div className="space-y-16 md:space-y-24">
            {education.map((edu, idx) => (
              <EducationEntry
                key={edu.id}
                edu={edu}
                idx={idx}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>

        {/* Activities / Workshops */}
        <motion.div
          className="mb-10 flex items-baseline gap-4 border-t border-border pt-10 md:mb-12"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: EASE.expo }}
        >
          <span className="label-mono text-acid">005B</span>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-paper md:text-3xl">
            Activities &amp; Workshops
          </h3>
          <span className="label-mono ml-auto text-ash">
            {activities.length.toString().padStart(2, "0")} ITEMS
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {activities.map((activity, idx) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              idx={idx}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-16 border-t border-border pt-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          <div className="label-mono flex items-center justify-between">
            <span className="text-ash">END / EDUCATION</span>
            <span className="text-acid">005A / 005B</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
