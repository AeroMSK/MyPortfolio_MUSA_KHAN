"use client";

import * as React from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import GradientCanvas from "@/components/motion/gradient-canvas";

// ============================================================
// Hero Section — editorial exhibition entrance
// Full viewport composition with choreographed reveal + scroll parallax
// ============================================================

// ---- Easings (from AGENT_BRIEF) ----
const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
  power: [0.19, 1, 0.22, 1] as const,
  smooth: [0.85, 0, 0.15, 1] as const,
};

// Align hero choreography with PageLoader (~1.4s)
const LOADER_DURATION_MS = 1400;

// Vertical editorial numbering (right edge)
const HERO_NUMBERS = [
  { num: "001", label: "BUILD" },
  { num: "002", label: "SHIP" },
  { num: "003", label: "EXPLORE" },
  { num: "004", label: "CREATE" },
] as const;

// Hero name — last word gets acid treatment + mobile indent
const NAME_WORDS: Array<{ text: string; variant: "default" | "acid"; mobileIndent?: boolean }> = [
  { text: "MUSA", variant: "default" },
  { text: "KHAN", variant: "acid", mobileIndent: true },
];

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

// ---- Portrait (uses /public/images/me/me1.png) ----
function PortraitFrame() {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-graphite">
      <img
        src="/images/me/me1.png"
        alt="Portrait of Musa Khan"
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      {/* Fallback if image doesn't exist */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-graphite">
        <div className="text-center">
          <p className="label-mono text-ash">PORTRAIT</p>
          <p className="font-display text-4xl text-ash/30">MK</p>
        </div>
      </div>
      {/* Crosshair corners */}
      <div className="absolute left-2 top-2 h-3 w-3 border-l border-t border-acid/50" />
      <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-acid/50" />
      <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-acid/50" />
      <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-acid/50" />
    </div>
  );
}

// ---- Name word (entrance reveal + scroll parallax) ----
function NameWord({
  text,
  variant,
  delay,
  ready,
  prefersReducedMotion,
  yMotion,
  mobileIndent,
}: {
  text: string;
  variant: "default" | "acid";
  delay: number;
  ready: boolean;
  prefersReducedMotion: boolean;
  yMotion: MotionValue<number>;
  mobileIndent?: boolean;
}) {
  const isAcid = variant === "acid";
  return (
    <motion.span className={cn("block overflow-hidden", mobileIndent && "pl-[20%] md:pl-0")} style={{ y: yMotion }}>
      <motion.span
        className={cn("block", isAcid ? "text-acid" : "text-paper")}
        initial={prefersReducedMotion ? false : { y: "110%" }}
        animate={ready ? { y: "0%" } : undefined}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.9,
          ease: EASE.expo,
          delay,
        }}
      >
        {text}
      </motion.span>
    </motion.span>
  );
}

// ---- Hero section ----
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Wait for the PageLoader to finish before kicking off the choreography.
  // setTimeout (even with 0ms) defers setState to avoid cascading renders
  // and satisfies the react-hooks/set-state-in-effect lint rule.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const delay = prefersReducedMotion ? 0 : LOADER_DURATION_MS;
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  // Scroll-driven parallax — fades hero + translates name/portrait
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const portraitY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : -60]
  );
  const nameY1 = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 24]);
  const nameY2 = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 48]);
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.85],
    [1, prefersReducedMotion ? 1 : 0.55]
  );
  const nameYs = [nameY1, nameY2];

  return (
    <motion.section
      ref={heroRef}
      id="hero"
      style={{ opacity: heroOpacity }}
      className="relative flex min-h-screen w-full scroll-mt-24 flex-col overflow-hidden bg-ink"
    >
      {/* === Animated gradient background === */}
      <div className="absolute inset-0 z-0">
        <GradientCanvas
          colors={['#070707', '#1D1F22', '#111214', '#0B0B0D', '#161719']}
          seed={462}
          speed={0.2}
          scale={0.36}
          turbAmp={0.25}
          turbFreq={0.1}
          turbIter={10}
          waveFreq={3}
          distBias={0}
          dither={0.2}
          ditherMode={1}
          exposure={1.0}
          contrast={1.1}
          saturation={0.8}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {/* === Top metadata strip === */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-30 px-6 pt-24 md:px-10 md:pt-28 lg:px-16"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: EASE.expo,
          delay: 0.2,
        }}
      >
        <div className="label-mono flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-paper/90">{siteConfig.shortName.toUpperCase()}</span>
          <span className="text-ash/40">/</span>
          <span className="text-ash">{siteConfig.universityShort}</span>
          <span className="hidden text-ash/40 sm:inline">/</span>
          <span className="hidden text-ash sm:inline">{siteConfig.location}</span>
          <span className="text-ash/40">/</span>
          <span className="text-acid">{siteConfig.year}</span>
        </div>
      </motion.div>

      {/* === Vertical editorial numbering (right edge, lg+) === */}
      <div className="pointer-events-none absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 lg:flex lg:flex-col lg:gap-3">
        {HERO_NUMBERS.map((n, i) => (
          <motion.div
            key={n.num}
            className="label-mono flex items-center gap-2"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            animate={ready ? { opacity: 1, x: 0 } : undefined}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              ease: EASE.expo,
              delay: 0.3 + i * 0.1,
            }}
          >
            <span className="text-acid">{n.num}</span>
            <span className="text-ash">/ {n.label}</span>
          </motion.div>
        ))}
      </div>

      {/* === Main composition === */}
      <div className="relative flex flex-1 items-center px-6 pb-44 pt-36 md:px-10 md:pb-40 md:pt-40 lg:px-16 lg:pb-44">
        <div className="relative mx-auto w-full max-w-editorial">
          <div className="relative">
            {/* HUGE NAME — left aligned on desktop; MUSA then KHAN indented on mobile */}
            <h1 className="relative z-10 font-display font-bold uppercase leading-[0.85] tracking-tightest text-[clamp(3rem,16vw,14rem)]">
              {NAME_WORDS.map((w, i) => (
                <NameWord
                  key={w.text}
                  text={w.text}
                  variant={w.variant}
                  delay={0.5 + i * 0.15}
                  ready={ready}
                  prefersReducedMotion={prefersReducedMotion}
                  yMotion={nameYs[i]}
                  mobileIndent={w.mobileIndent}
                />
              ))}
            </h1>

            {/* PORTRAIT — mobile: below name; md+: absolute, overlapping right edge of name */}
            <div className="relative z-20 mt-8 w-3/4 max-w-[260px] sm:max-w-[300px] md:mt-0 md:absolute md:right-0 md:top-1/2 md:w-[28vw] md:max-w-[360px] md:-translate-y-1/2 lg:right-16">
              <motion.div
                style={{ y: portraitY }}
                initial={
                  prefersReducedMotion
                    ? false
                    : { clipPath: "inset(100% 0% 0% 0%)", scale: 1.1 }
                }
                animate={
                  ready
                    ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
                    : undefined
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 1.2,
                  ease: EASE.expo,
                  delay: 0.8,
                }}
              >
                <PortraitFrame />
              </motion.div>
            </div>

            {/* Mobile hero copy — placed BELOW the portrait so it doesn't overlap */}
            <div className="relative z-30 mt-8 space-y-2 md:hidden">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-acid">
                {siteConfig.profession}{" "}
                <span className="text-ash">/</span>{" "}
                {siteConfig.subProfession}
              </p>
              <p className="font-sans text-sm leading-relaxed text-paper/70">
                I build software. I research systems. I create things that move.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === Bottom row: copy + CTAs + scroll indicator === */}
      {/* On mobile, only show CTAs + scroll indicator (copy moved above to avoid overlap) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 md:px-10 md:pb-10 lg:px-16"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          ease: EASE.expo,
          delay: 1.1,
        }}
      >
        <div className="mx-auto max-w-editorial">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            {/* Hero copy — only visible on desktop (moved above on mobile) */}
            <div className="hidden max-w-md space-y-2 md:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-acid">
                {siteConfig.profession}{" "}
                <span className="text-ash">/</span>{" "}
                {siteConfig.subProfession}
              </p>
              <p className="font-sans text-sm leading-relaxed text-paper/70 md:text-base">
                I build software. I research systems. I create things that move.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#work"
                data-cursor-label="GO"
                className="group inline-flex items-center gap-2 rounded-full bg-acid px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-acid-soft"
              >
                View Work
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="label-mono mt-8 flex items-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={ready ? { opacity: 1 } : undefined}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              ease: EASE.expo,
              delay: 1.4,
            }}
          >
            <span className="text-ash">Scroll</span>
            <div className="relative h-[1px] w-16 overflow-hidden bg-iron">
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-acid"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    delay: 1.5,
                    duration: 1.4,
                    ease: EASE.smooth,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              )}
            </div>
            <ArrowDown className="h-3 w-3 animate-float-slow text-acid" />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
