"use client";

import * as React from "react";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { techGroups } from "@/data/technologies";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/motion/text-reveal";

// ============================================================
// WORK SECTION — Amplytic-style sticky stacking cards
//
// Reference: upload/works.jsx (Amplytic)
// Pattern (SIMPLIFIED to match reference exactly):
//   1. Section header at top (small metadata label)
//   2. Invisible scroll anchor (h-[150vh]) defines scroll range for first card
//   3. First card: sticky top-0 h-screen with:
//      - WORK text splitting (WO left, RK right) as user scrolls
//      - Card scaling 0.1 → 1 as user scrolls
//      - WORK text fades out after split completes
//   4. Subsequent cards: JUST sticky top-0 h-screen + 10vh spacer
//      - NO animation — they naturally stack on top of the previous card
//      - This is exactly how Amplytic does it (see works.jsx lines 137-147)
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

// ---- Helper: detect placeholder URLs ("TODO" / "YOUR_*") ----
function isTodoUrl(url?: string): boolean {
  if (!url) return true;
  return url === "TODO" || url.startsWith("YOUR_");
}

const HAS_IMAGES = true;

// ============================================================
// ImagePlaceholder — editorial poster for missing project images
// ============================================================
function ImagePlaceholder({ project }: { project: Project }) {
  return (
    <div
      role="img"
      aria-label={`${project.title} preview — placeholder`}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-iron/40 via-graphite to-steel/30" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #EAEAEA 1px, transparent 1px), linear-gradient(to bottom, #EAEAEA 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none font-display font-bold text-[clamp(6rem,18vw,14rem)] leading-none text-paper/[0.06]">
          {project.index}
        </span>
      </div>
      <div className="relative z-10 px-6 text-center">
        <p className="label-mono mb-2 text-acid">{project.index} · PREVIEW</p>
        <p className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold uppercase tracking-tight text-paper/90">
          {project.title}
        </p>
        <p className="label-mono mt-2 text-ash">{project.category}</p>
      </div>
      <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-acid/60" />
      <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-acid/60" />
      <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-acid/60" />
      <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-acid/60" />
      <div className="label-mono absolute left-3 right-3 top-3 flex items-center justify-between">
        <span className="text-ash">PREVIEW</span>
      </div>
    </div>
  );
}

// ============================================================
// ProjectImage — single image inside a zinc-200 frame (matches reference)
// ============================================================
function ProjectImage({ project }: { project: Project }) {
  return (
    <div className="w-full rounded-lg bg-iron/30 p-[5px]">
      <div className="relative w-full aspect-[149/100] overflow-hidden rounded-lg border border-border bg-graphite">
        <img
          src={project.images[0]?.src || "/images/projects/placeholder.png"}
          alt={project.images[0]?.alt || `${project.title} preview`}
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}

// ============================================================
// ProjectHeadingBar — light editorial bar above the image card
// (matches Amplytic works.jsx: white bar with name + tag + 3-dot menu)
// ============================================================
function ProjectHeadingBar({ project }: { project: Project }) {
  return (
    <div className="mb-1.5 flex items-center justify-between rounded-xl border border-border bg-graphite px-5 py-3.5">
      <div className="flex items-center gap-2">
        <span
          className="font-display text-[17px] font-semibold leading-none tracking-tight text-paper"
          style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          {project.title}
        </span>
      </div>
      <div className="flex items-center gap-[5px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[7px] w-[7px] rounded-full bg-ash/60" />
        ))}
      </div>
    </div>
  );
}

// ---- Tech icon lookup — maps project tech names to Iconify URLs ----
const TECH_ICON_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const group of techGroups) {
    for (const tech of group.techs) {
      map[tech.name.toLowerCase()] = tech.icon;
    }
  }
  map["react native"] = "https://api.iconify.design/devicon/react.svg";
  map["modern web stack"] = "https://api.iconify.design/devicon/javascript.svg";
  return map;
})();

function getTechIcon(name: string): string {
  return TECH_ICON_MAP[name.toLowerCase()] || "https://api.iconify.design/devicon/javascript.svg";
}

// ============================================================
// DesktopRightPanel — tools with icons + View Project (RIGHT column, desktop only)
// ============================================================
function DesktopRightPanel({
  project,
  progress,
}: {
  project: Project;
  progress?: MotionValue<number>;
}) {
  const livePending = isTodoUrl(project.liveUrl);
  const srcPending = isTodoUrl(project.githubUrl);
  return (
    <div className="flex flex-col gap-4 px-1">
      <p className="label-mono text-ash">
        <span className="text-acid">/</span> TOOLS
      </p>
      <div className="grid grid-cols-3 gap-2">
        {project.technologies.map((tech, i) => (
          <div
            key={tech}
            className="group flex flex-col items-center gap-1.5 rounded-lg border border-border bg-graphite/60 p-2.5 transition-all duration-300 hover:border-acid/40 hover:bg-graphite"
          >
            <div className="flex h-7 w-7 items-center justify-center">
              <img
                src={getTechIcon(tech)}
                alt={tech}
                width={28}
                height={28}
                loading="lazy"
                className="h-full w-full object-contain [filter:invert(1)_sepia(1)_saturate(0)_hue-rotate(180deg)_brightness(1.1)] transition-all duration-300 group-hover:[filter:none]"
              />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ash text-center leading-tight">
              {tech}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px w-full bg-border" />
      <div className="flex flex-col gap-2">
        {livePending ? (
          <button type="button" disabled aria-disabled="true" className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-transparent px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ash opacity-50">
            View Project <ArrowUpRight className="h-3 w-3" />
          </button>
        ) : (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor-label="VIEW" className="group inline-flex items-center justify-center gap-2 rounded-full bg-acid px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-acid-soft">
            View Project <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
        {srcPending ? (
          <button type="button" disabled aria-disabled="true" className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-transparent px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ash opacity-50">
            <Github className="h-3 w-3" /> Source
          </button>
        ) : (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" data-cursor-label="OPEN" className="group inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-paper transition-colors duration-300 hover:border-acid hover:text-acid">
            <Github className="h-3 w-3" /> Source
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ProjectSidePanel — details shown BELOW the image (within card width)
// Uses TextReveal for per-character scroll color transition on descriptions.
// Accepts an optional `progress` MotionValue from the parent card's
// useScroll — this is CRITICAL for sticky cards where the element's own
// position doesn't change while pinned, so TextReveal's internal useScroll
// would get stuck. Passing the parent's scroll progress ensures the
// color transition animates smoothly across the full pinned duration.
// ============================================================
function ProjectSidePanel({
  project,
  progress,
  descriptionOnly = false,
}: {
  project: Project;
  progress?: MotionValue<number>;
  descriptionOnly?: boolean;
}) {
  const livePending = isTodoUrl(project.liveUrl);
  const srcPending = isTodoUrl(project.githubUrl);

  return (
    <motion.div
      className="flex flex-col gap-3 px-1 pt-5"
      initial={false}
    >
      {/* Category label */}
      <p className="label-mono text-acid">
        {project.index} · {project.category}
      </p>

      {/* Description — per-character scroll color transition (same as About section) */}
      <TextReveal
        text={project.description}
        as="p"
        mode="char"
        className="font-sans text-sm leading-relaxed"
        progress={progress}
      />
      {project.longDescription && (
        <TextReveal
          text={project.longDescription}
          as="p"
          mode="char"
          className="font-sans text-xs leading-relaxed"
          progress={progress}
        />
      )}

      {/* Tech badges + buttons — only on mobile (hidden when descriptionOnly=true for desktop LEFT column) */}
      {!descriptionOnly && (
        <>
          {/* Tech badges */}
          <ul className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-graphite/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70"
              >
                <span className="h-1 w-1 rounded-full bg-acid" aria-hidden="true" />
                {tech}
              </li>
            ))}
          </ul>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {livePending ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ash opacity-50"
          >
            View Project
            <ArrowUpRight className="h-3 w-3" />
          </button>
        ) : (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="VIEW"
            className="group inline-flex items-center gap-2 rounded-full bg-acid px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-acid-soft"
          >
            View Project
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
        {srcPending ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ash opacity-50"
          >
            <Github className="h-3 w-3" />
            Source
          </button>
        ) : (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="OPEN"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-paper transition-colors duration-300 hover:border-acid hover:text-acid"
          >
            <Github className="h-3 w-3" />
            Source
          </a>
        )}
      </div>
        </>
      )}
    </motion.div>
  );
}

// ============================================================
// ProjectCardOnly — card (heading + image) + description with
// independent transition animation for the description.
//
// Used by both FirstStackCard and StackedCard.
// The card (heading + image) is always visible.
// The description animates in based on the passed MotionValues
// (descriptionOpacity, descriptionY) OR a simple whileInView fallback.
// ============================================================
function ProjectCardOnly({
  project,
  descriptionOpacity,
  descriptionY,
  prefersReducedMotion,
  useScrollDrivenDescription = false,
  progress,
}: {
  project: Project;
  descriptionOpacity?: MotionValue<number>;
  descriptionY?: MotionValue<number>;
  prefersReducedMotion: boolean;
  useScrollDrivenDescription?: boolean;
  progress?: MotionValue<number>;
}) {
  return (
    <div className="flex w-full max-w-[600px] flex-col md:max-w-[1100px]">
      {/* Browser-style heading bar (matches Amplytic ProjectHeadingBar) */}
      <ProjectHeadingBar project={project} />

      {/* MOBILE: single-column (heading → image → description → badges → buttons) */}
      <div className="md:hidden">
        {/* Image card */}
        <ProjectImage project={project} />
        {/* Description panel */}
        {useScrollDrivenDescription && descriptionOpacity && descriptionY ? (
          <motion.div
            style={{ opacity: descriptionOpacity, y: descriptionY }}
            className="overflow-hidden"
          >
            <ProjectSidePanel project={project} progress={progress} />
          </motion.div>
        ) : (
          <motion.div
            className="overflow-hidden"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: EASE.expo,
              delay: prefersReducedMotion ? 0 : 0.3,
            }}
          >
            <ProjectSidePanel project={project} progress={progress} />
          </motion.div>
        )}
      </div>

      {/* DESKTOP: 3-column layout (description LEFT | screenshot CENTER | tools+buttons RIGHT) */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6">
        {/* LEFT: Description (NO tech badges, NO buttons on desktop — those are in RIGHT column) */}
        <div className="md:col-span-3">
          {useScrollDrivenDescription && descriptionOpacity && descriptionY ? (
            <motion.div style={{ opacity: descriptionOpacity, y: descriptionY }}>
              <ProjectSidePanel project={project} progress={progress} descriptionOnly={true} />
            </motion.div>
          ) : (
            <ProjectSidePanel project={project} progress={progress} descriptionOnly={true} />
          )}
        </div>
        {/* CENTER: Screenshot */}
        <div className="md:col-span-6">
          <ProjectImage project={project} />
        </div>
        {/* RIGHT: Tools with icons + View Project button */}
        <div className="md:col-span-3">
          <DesktopRightPanel project={project} progress={progress} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FullProjectCard — compact centered card (legacy, kept for reference)
// ============================================================
function FullProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex w-full max-w-[600px] flex-col">
      <ProjectHeadingBar project={project} />
      <ProjectImage project={project} />
      <ProjectSidePanel project={project} />
    </div>
  );
}

// ============================================================
// FirstStackCard — "WORK" text splits apart + project card grows between
//
// Per Amplytic reference (works.jsx):
//   - Sticky top-0 h-screen
//   - Scroll anchor (h-[150vh]) defines the scroll range
//   - useScroll offset: ["start start", "end start"]
//   - Card scales 0.1 → 1 across the scroll range
//   - WORK text splits: WO goes left, RK goes right
//   - WORK text fades out after split completes
// ============================================================
function FirstStackCard({
  project,
  scrollRef,
  prefersReducedMotion,
}: {
  project: Project;
  scrollRef: React.RefObject<HTMLElement | null>;
  prefersReducedMotion: boolean;
}) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    // Per Amplytic reference (works.jsx): offset ["start start", "end end"]
    // - Progress 0 = anchor top hits viewport top
    // - Progress 1 = anchor bottom hits viewport bottom
    // With anchor height 150vh and viewport 100vh, the animation completes
    // in (150vh - 100vh) = 50vh of scroll. This gives the first card enough
    // time to fully appear BEFORE the second card arrives at scroll position
    // 100vh (first card) + 50vh (spacer) = 150vh.
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Splitting "WORK" text — ±50% keeps both halves visible on screen
  const xLeft = useTransform(smoothProgress, [0, 0.5], ["0%", "-50%"]);
  const xRight = useTransform(smoothProgress, [0, 0.5], ["0%", "50%"]);
  // WORK text fades out only AFTER the split completes (0.5 → 0.7)
  const textOpacity = useTransform(smoothProgress, [0.5, 0.7], [1, 0]);

  // Card scales 0.1 → 1 across the full scroll range (matches Amplytic)
  // Start at 0.05 so there's a tiny delay, reach full size by 0.75
  const cardScale = useTransform(smoothProgress, [0.05, 0.75], [0.1, 1]);
  const cardOpacity = useTransform(smoothProgress, [0.05, 0.25], [0, 1]);

  // Description appears AFTER the card is fully scaled (0.75 → 0.9)
  // This creates the two-phase animation: card first, then description
  const descriptionOpacity = useTransform(
    smoothProgress,
    [0.75, 0.9],
    [0, 1]
  );
  const descriptionY = useTransform(
    smoothProgress,
    [0.75, 0.9],
    [20, 0]
  );

  return (
    <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
      {/*
        WORK text — positioned absolutely, fills the entire sticky viewport.
        z-20 puts it ABOVE the card (z-10) so it's always visible during the split.
        Forced to paper-white via inline color + CSS .work-split-text fallback.

        CRITICAL: Even when prefersReducedMotion is true, we STILL render the WORK
        text. We just skip the animation (x transforms stay at 0, meaning "WO" and
        "RK" sit together as "WORK"). This prevents the "WORK text is not showing"
        bug on browsers with prefers-reduced-motion enabled (e.g., Windows with
        "Animation effects" setting turned off).
      */}
      <motion.div
        style={{
          opacity: prefersReducedMotion ? 1 : textOpacity,
          color: "#EAEAEA",
        }}
        className="work-split-text pointer-events-none absolute inset-0 z-20 flex h-full w-full items-center justify-center whitespace-nowrap font-display text-[25vw] font-bold uppercase leading-none tracking-tighter md:text-[280px]"
        aria-hidden="true"
      >
        <motion.div style={{ x: prefersReducedMotion ? 0 : xLeft }} className="inline-block">
          WO
        </motion.div>
        <motion.div style={{ x: prefersReducedMotion ? 0 : xRight }} className="inline-block">
          RK
        </motion.div>
      </motion.div>

      {/*
        Card group — compact card (max-w-[600px]) centered on the viewport.
        Sits BEHIND the WORK text (z-10). Scales 0.1 → 1 as user scrolls.

        Two-phase animation:
          Phase 1 (progress 0.05 → 0.75): Card (heading + image) scales in
          Phase 2 (progress 0.75 → 0.9): Description fades + slides in

        When prefersReducedMotion is true, the card shows at full scale/opacity
        immediately (no animation), but is still rendered and visible.
      */}
      <div className="relative flex w-full max-w-[90vw] items-center justify-center sm:max-w-[600px] md:max-w-[1100px]">
        <motion.div
          style={{
            scale: prefersReducedMotion ? 1 : cardScale,
            opacity: prefersReducedMotion ? 1 : cardOpacity,
          }}
          className="relative z-10 w-full"
        >
          <ProjectCardOnly
            project={project}
            descriptionOpacity={
              prefersReducedMotion ? undefined : descriptionOpacity
            }
            descriptionY={prefersReducedMotion ? undefined : descriptionY}
            prefersReducedMotion={prefersReducedMotion}
            useScrollDrivenDescription={true}
            progress={prefersReducedMotion ? undefined : smoothProgress}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// StackedCard — each subsequent project stacks on top
//
// Per Amplytic reference (works.jsx lines 137-147):
//   - JUST sticky top-0 h-screen, NO card-level animation
//   - Followed by a 10vh spacer
//   - Cards naturally stack because each sticky card covers the previous
//     when it sticks at top:0
//
// DESCRIPTION ANIMATION:
//   Each StackedCard has its own useScroll on the sticky container.
//   The description animates in AFTER the card has stacked (i.e., when the
//   sticky card is pinned at top:0). This creates the "card appears first,
//   then description transitions in" effect for EVERY project, not just
//   the first one.
//
//   Scroll progress for each StackedCard (offset: ["start start", "end end"]):
//     - Progress 0: card top at viewport top (card just pinned/sticky)
//     - Progress 1: card bottom at viewport bottom (card about to leave)
//
//   This gives a full 0→1 range WHILE the card is pinned, which we use
//   for the description animation:
//     - opacity: [0.1, 0.3] → [0, 1] (fades in shortly after pin starts)
//     - y: [0.1, 0.3] → [20, 0] (slides up shortly after pin starts)
//
//   The description stays fully visible (opacity 1) for the rest of the
//   pinned duration (progress 0.3 → 1.0), then the next card stacks on top.
// ============================================================
function StackedCard({
  project,
  prefersReducedMotion,
}: {
  project: Project;
  prefersReducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll progress for this card.
  // offset ["start end", "start start"]:
  //   - Progress 0: card top hits viewport bottom (card entering from below)
  //   - Progress 1: card top hits viewport top (card fully pinned at top:0)
  // This gives a 0→1 range AS the card scrolls up into view, which we pass
  // to TextReveal for the per-character color transition. The transition
  // completes by the time the card is fully pinned.
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      {/*
        Sticky card — no animation, just naturally stacks on top.
        CRITICAL: bg-slate-deep on the CONTENT WRAPPER (not the sticky
        container) so that:
        1. The sticky container is transparent (no "background sliding up")
        2. The content wrapper has a solid background that covers the
           previous card's content when it slides up
      */}
      <div
        ref={cardRef}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <div className="w-full max-w-[90vw] rounded-xl bg-slate-deep p-4 sm:max-w-[600px] md:max-w-[1100px]">
          <ProjectCardOnly
            project={project}
            prefersReducedMotion={prefersReducedMotion}
            useScrollDrivenDescription={false}
            progress={prefersReducedMotion ? undefined : smoothProgress}
          />
        </div>
      </div>
      {/* 10vh spacer creates the stacking rhythm (per Amplytic reference) */}
      <div className="h-[10vh] w-full" />
    </>
  );
}

// ============================================================
// SectionHeader — top metadata label only
// ============================================================
function SectionHeader({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  return (
    <section className="relative z-30 flex h-[20vh] min-h-[160px] flex-col justify-end px-6 pb-8 md:px-10 lg:px-16 lg:pb-10">
      <div className="mx-auto w-full max-w-editorial">
        <motion.div
          className="label-mono flex flex-wrap items-center gap-x-4 gap-y-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: EASE.expo }}
        >
          <span className="text-acid">001 / WORK</span>
          <span className="text-ash/30">—</span>
          <span className="text-ash">SELECTED PROJECTS</span>
          <span className="text-ash/30">—</span>
          <span className="text-ash">2023 — 2026</span>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// SectionFooter — endcap with index count
// ============================================================
function SectionFooter({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  return (
    <footer className="border-t border-border">
      <div className="label-mono mx-auto flex max-w-editorial items-center justify-between px-6 py-8 md:px-10 md:py-12 lg:px-16">
        <motion.span
          className="text-ash"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          END / WORK
        </motion.span>
        <motion.span
          className="text-acid"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {String(projects.length).padStart(3, "0")} /{" "}
          {String(projects.length).padStart(3, "0")}
        </motion.span>
      </div>
    </footer>
  );
}

// ============================================================
// WorkSection — main export
// ============================================================
export function WorkSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Anchor for the scroll progress of the first card's animation
  const stackRef = useRef<HTMLElement>(null);

  const first = projects[0];
  const rest = projects.slice(1);

  return (
    <section id="work" className="relative scroll-mt-24 bg-slate-deep">
      <SectionHeader prefersReducedMotion={prefersReducedMotion} />

      {/*
       * STACKING CARDS WRAPPER
       *
       * Per Amplytic works.jsx reference:
       *   1. Invisible scroll anchor (h-[150vh]) — defines scroll range
       *   2. First sticky card — has WORK split + card scale animation
       *   3. Subsequent sticky cards — JUST sticky, no animation, naturally stack
       *   4. Each card followed by 10vh spacer for stacking rhythm
       */}
      <div className="relative z-10 w-full pb-[10vh]">
        {/* Invisible scroll anchor */}
        <div
          ref={stackRef as React.RefObject<HTMLDivElement>}
          className="pointer-events-none absolute left-0 top-0 h-[150vh] w-full"
          aria-hidden="true"
        />

        {/* 1. First card with WORK split + scale animation */}
        <FirstStackCard
          project={first}
          scrollRef={stackRef}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/*
         * CRITICAL: h-[50vh] spacer between the first card and subsequent cards.
         *
         * Per Amplytic reference (works.jsx line 135):
         *   <div className="h-[50vh] w-full" />
         *
         * This spacer gives the first card's scale animation time to FULLY
         * complete before the second card arrives and stacks on top.
         *
         * Without this spacer, the second card arrives immediately after the
         * first card's 100vh, while the scale animation is still running —
         * causing the "mismatched appearing" / overlapping issue.
         *
         * Timeline with this spacer:
         *   - Scroll 0 → 50vh: First card's scale animation plays (0.1 → 1)
         *   - Scroll 50vh → 100vh: First card fully visible (rest period)
         *   - Scroll 100vh → 150vh: First card stays sticky, second card slides up
         *   - Scroll 150vh: Second card sticks at top:0, covers first card
         *
         * The first card is fully appeared (animation done at 50vh) well
         * before the second card arrives (at 150vh). No overlapping.
         */}
        <div className="h-[50vh] w-full" />

        {/* 2..N. Subsequent stacking cards — no animation, just sticky */}
        {rest.map((project) => (
          <StackedCard
            key={project.id}
            project={project}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      <SectionFooter prefersReducedMotion={prefersReducedMotion} />
    </section>
  );
}
