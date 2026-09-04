"use client";

import * as React from "react";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, FileText } from "lucide-react";
import { publications, type Publication } from "@/data/publications";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/motion/text-reveal";

// ============================================================
// RESEARCH / PUBLICATIONS SECTION
// Cinematic flowing presentation of academic publications, mirroring
// the Work section's editorial language but tuned for research.
//
// Data-driven: iterates over the `publications` array from
// @/data/publications. Adding a new publication = appending an
// object to that array. Nothing in this file is publication-specific.
//
// Layout per publication:
//   ┌─────────────────────────────────────────────────────────────┐
//   │ BIG number (01) + venue + year + category                    │
//   ├──────────────────┬──────────────────────────────────────────┤
//   │ sticky left col   │  Title (huge)                            │
//   │  · index          │  Abstract (max-w-prose)                  │
//   │  · venue          │  Methods badges (staggered)              │
//   │  · tags           │  Research images (clip-path reveal +     │
//   │                   │           parallax drift, flowing)       │
//   │                   │  GO TO PAPER → button                    │
//   └──────────────────┴──────────────────────────────────────────┘
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

// ---- Helper: paper URL is "coming soon" (placeholder "#") ----
function isPaperUrlPending(url?: string): boolean {
  return !url || url === "#";
}

// ============================================================
// HAS_IMAGES — flip to true once /public/images/research/*.png
// exist. While false, ResearchImage renders an editorial poster
// placeholder so the section never looks broken.
// ============================================================
const HAS_IMAGES = false;

// ============================================================
// ResearchImagePlaceholder — academic editorial poster
// ============================================================
function ResearchImagePlaceholder({
  publication,
  imageIndex,
  caption,
}: {
  publication: Publication;
  imageIndex: number;
  caption?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${publication.shortTitle} — figure ${imageIndex + 1}${
        caption ? `: ${caption}` : ""
      } — preview placeholder`}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-iron/40 via-graphite to-steel/30" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #EAEAEA 1px, transparent 1px), linear-gradient(to bottom, #EAEAEA 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Giant watermark — paper preview */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none font-display font-bold text-[clamp(6rem,16vw,14rem)] leading-none text-paper/[0.04]">
          PAPER
        </span>
      </div>

      {/* Center label */}
      <div className="relative z-10 px-6 text-center">
        <p className="label-mono mb-3 text-acid">
          PAPER · PREVIEW
        </p>
        <p className="font-display text-[clamp(1rem,2.2vw,1.5rem)] font-semibold uppercase tracking-tight text-paper/90">
          {publication.shortTitle}
        </p>
        {caption ? (
          <p className="label-mono mt-2 text-ash">{caption}</p>
        ) : null}
      </div>

      {/* Crosshair corners */}
      <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-acid/60" />
      <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-acid/60" />
      <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-acid/60" />
      <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-acid/60" />

      {/* Top edge metadata */}
      <div className="label-mono absolute left-3 right-3 top-3 flex items-center justify-between">
        <span className="text-ash">PREVIEW UNAVAILABLE</span>
        <span className="text-acid">{publication.year}</span>
      </div>

      {/* Bottom edge metadata */}
      <div className="label-mono absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="text-ash">{publication.venue}</span>
        <span className="text-paper/60">{publication.id.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ============================================================
// ResearchImage — single figure with clip-path reveal + scroll parallax
// ============================================================
function ResearchImage({
  publication,
  image,
  imageIndex,
  imageY,
  imageScale,
  prefersReducedMotion,
}: {
  publication: Publication;
  image: { src: string; alt: string; caption?: string };
  imageIndex: number;
  imageY: MotionValue<number>;
  imageScale: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const useRealImage = HAS_IMAGES;
  // Single paper screenshot — wide cinematic ratio
  const aspect = "aspect-[16/10]";

  return (
    <figure className="relative w-full">
      <motion.div
        className={cn(
          "relative w-full overflow-hidden border border-border bg-graphite",
          aspect
        )}
        style={{ y: prefersReducedMotion ? 0 : imageY }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ scale: prefersReducedMotion ? 1 : imageScale }}
          initial={
            prefersReducedMotion ? false : { clipPath: "inset(0 100% 0 0)" }
          }
          whileInView={
            prefersReducedMotion ? undefined : { clipPath: "inset(0 0 0 0)" }
          }
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE.expo }}
        >
          {useRealImage ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              placeholder="empty"
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          ) : (
            <ResearchImagePlaceholder
              publication={publication}
              imageIndex={imageIndex}
              caption={image.caption}
            />
          )}
        </motion.div>
      </motion.div>
      {image.caption ? (
        <figcaption className="label-mono mt-3 text-ash">
          <span className="text-acid">PAPER</span>
          <span className="mx-2 text-ash/40">—</span>
          <span>{image.caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

// ============================================================
// PaperButton — "GO TO PAPER →" with disabled-looking state
// When paperUrl is "#" / missing → renders a disabled-looking
// button with a custom hover tooltip ("Paper URL coming soon")
// + a native title attribute for screen readers.
// ============================================================
function PaperButton({
  publication,
  prefersReducedMotion,
}: {
  publication: Publication;
  prefersReducedMotion: boolean;
}) {
  const pending = isPaperUrlPending(publication.paperUrl);
  const baseBtn =
    "group relative inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300";

  if (pending) {
    return (
      <motion.div
        className="relative inline-block"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Paper URL coming soon"
          title="Paper URL coming soon"
          data-cursor-label="GO"
          className={cn(
            baseBtn,
            "cursor-not-allowed border border-border bg-transparent text-ash opacity-50"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Go to Paper</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
        {/* Custom hover tooltip */}
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-sm border border-acid/30 bg-charcoal px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-acid opacity-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-within:-translate-y-1 group-focus-within:opacity-100"
        >
          Paper URL coming soon
        </span>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={publication.paperUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="GO"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      className={cn(baseBtn, "bg-acid text-ink hover:bg-acid-soft")}
    >
      <FileText className="h-3.5 w-3.5" />
      <span>Go to Paper</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}

// ============================================================
// PublicationBlock — one academic publication
// ============================================================
function PublicationBlock({
  publication,
  index,
}: {
  publication: Publication;
  index: number;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Scroll progress across the block (entering → exiting)
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"],
  });

  // Image parallax drift across the block's lifetime in viewport
  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  // Image subtle scale-in (0.95 → 1 across first half)
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  // Floating index number — drifts down + fades in/out at edges
  const numberY = useTransform(scrollYProgress, [0, 1], [-20, 40]);
  const numberOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0.3, 1, 1, 0.3]
  );

  // Subtle alternating background tone (matches Work section rhythm)
  const altBg = index % 2 === 1;

  return (
    <article
      ref={blockRef}
      className={cn(
        "relative min-h-[80vh] border-t border-border py-16 md:py-24 lg:py-32",
        altBg && "bg-ink/40"
      )}
      aria-labelledby={`pub-${publication.id}-title`}
    >
      {/* Top header strip — "01 PUBLICATION" label + venue/year */}
      <motion.div
        className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-6 md:mb-14 md:pb-8"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE.expo }}
      >
        <div className="flex items-baseline gap-3">
          <motion.span
            style={{
              y: prefersReducedMotion ? 0 : numberY,
              opacity: prefersReducedMotion ? 1 : numberOpacity,
            }}
            className="block select-none font-display font-bold text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-ash/40 tracking-tightest"
            aria-hidden="true"
          >
            {publication.index}
          </motion.span>
          <span className="label-mono text-ash">PUBLICATION</span>
        </div>
        <div className="label-mono shrink-0 space-y-1 text-right">
          <div className="text-acid">{publication.venue}</div>
          <div className="text-ash">{publication.type}</div>
          <div className="text-ash">{publication.year}</div>
        </div>
      </motion.div>

      {/* Content grid — sticky left metadata + flowing right column */}
      <div className="relative grid grid-cols-12 gap-6 md:gap-10 lg:gap-12">
        {/* Sticky left column: index + venue + tags */}
        <motion.aside
          className="col-span-12 md:col-span-4 lg:col-span-3"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE.expo }}
        >
          <div className="md:sticky md:top-28">
            <div className="space-y-6">
              {/* Index marker */}
              <div className="flex items-baseline gap-3 border-b border-border pb-4">
                <span className="font-display font-bold text-3xl text-acid">
                  {publication.index}
                </span>
                <span className="label-mono text-ash">
                  {publication.type.toUpperCase()}
                </span>
              </div>

              {/* Venue + Year */}
              <div className="label-mono space-y-2">
                <div className="text-ash">VENUE</div>
                <div className="font-display text-sm normal-case tracking-tight text-paper leading-snug">
                  {publication.fullVenue}
                </div>
                <div className="text-acid">{publication.year}</div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="label-mono text-ash">TAGS</div>
                <ul className="flex flex-wrap gap-1.5">
                  {publication.tags.map((tag, i) => (
                    <motion.li
                      key={tag}
                      className="font-mono text-[10px] tracking-[0.15em] uppercase border border-acid/30 bg-acid/5 px-2 py-0.5 rounded-sm text-acid/90"
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, y: 6 }
                      }
                      whileInView={
                        prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                      }
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.4,
                        ease: EASE.expo,
                        delay: prefersReducedMotion ? 0 : 0.1 + i * 0.08,
                      }}
                    >
                      {tag}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Paper status */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="label-mono text-ash">PAPER</div>
                <div className="label-mono">
                  {isPaperUrlPending(publication.paperUrl) ? (
                    <span className="text-ash">URL — COMING SOON</span>
                  ) : (
                    <span className="text-acid">PUBLISHED · ONLINE</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Right column: title + image + abstract + methods + button */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {/* Title — per-character scroll color transition (same as About section) */}
          <h3
            id={`pub-${publication.id}-title`}
            className="font-display font-semibold tracking-tight text-[clamp(1.5rem,4vw,3rem)] leading-[1.1]"
          >
            <TextReveal
              text={publication.title}
              as="span"
              mode="char"
              className="font-display font-semibold tracking-tight text-[clamp(1.5rem,4vw,3rem)] leading-[1.1]"
            />
          </h3>

          {/* Paper screenshot — compact size, appears right after title */}
          {publication.images.length > 0 ? (
            <div className="mt-8 max-w-md">
              <ResearchImage
                key={`${publication.id}-img-0`}
                publication={publication}
                image={publication.images[0]}
                imageIndex={0}
                imageY={imageY}
                imageScale={imageScale}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ) : null}

          {/* Abstract */}
          <motion.p
            className="mt-8 max-w-prose text-base leading-relaxed text-paper/80 md:text-lg"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE.expo, delay: 0.3 }}
          >
            {publication.abstract}
          </motion.p>

          {/* Methods / Techniques */}
          <motion.div
            className="mt-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: EASE.expo, delay: 0.4 }}
          >
            <div className="label-mono mb-3 text-ash">
              METHODS / TECHNIQUES
            </div>
            <ul className="flex flex-wrap gap-2">
              {publication.methods.map((method, i) => (
                <motion.li
                  key={method}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] uppercase border border-border bg-graphite/60 px-2.5 py-1 rounded-sm text-paper/80"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.4,
                    ease: EASE.expo,
                    delay: prefersReducedMotion ? 0 : 0.5 + i * 0.07,
                  }}
                >
                  <span className="h-1 w-1 rounded-full bg-acid" aria-hidden="true" />
                  {method}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* CTA */}
          <div className="mt-12">
            <PaperButton
              publication={publication}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// SectionHeader — top metadata + huge title + intro
// ============================================================
function SectionHeader() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-editorial px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20">
        {/* Top metadata strip */}
        <motion.div
          className="label-mono flex flex-wrap items-center gap-x-4 gap-y-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE.expo }}
        >
          <span className="text-acid">002 / RESEARCH</span>
          <span className="text-ash/30">—</span>
          <span className="text-ash">PUBLICATIONS</span>
          <span className="text-ash/30">—</span>
          <span className="text-ash">{publications[0]?.year ?? "2026"}</span>
        </motion.div>

        {/* Huge title — "RESEARCH / PUBLICATIONS" */}
        <motion.h2
          className="mt-8 font-display font-bold uppercase tracking-tightest leading-[0.9]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE.expo, delay: 0.1 }}
        >
          <span className="block text-[clamp(2.5rem,9vw,7rem)] text-paper">
            Research
          </span>
          <span className="mt-1 flex items-baseline gap-3 text-[clamp(2.5rem,9vw,7rem)]">
            <span className="text-acid">/</span>
            <span className="text-paper">Publications</span>
          </span>
        </motion.h2>

        {/* Sub-text + count */}
        <div className="mt-10 grid grid-cols-12 gap-6 md:gap-10">
          <motion.p
            className="col-span-12 max-w-prose text-base leading-relaxed text-paper/70 md:col-span-7 md:text-lg"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE.expo, delay: 0.3 }}
          >
            Research at the intersection of software, machine learning,
            explainability, and applied AI.
          </motion.p>
          <motion.div
            className="label-mono col-span-12 space-y-1 md:col-span-5 md:text-right"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE.expo, delay: 0.4 }}
          >
            <div className="text-acid">
              {String(publications.length).padStart(2, "0")} PUBLICATIONS
            </div>
            <div className="text-ash">PEER-REVIEWED · ACADEMIC</div>
            <div className="text-ash">RESEARCHED · WRITTEN · SUBMITTED</div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// SectionFooter — endcap
// ============================================================
function SectionFooter() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <footer className="border-t border-border">
      <div className="label-mono mx-auto flex max-w-editorial items-center justify-between px-6 py-8 md:px-10 md:py-12 lg:px-16">
        <motion.span
          className="text-ash"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          END / RESEARCH
        </motion.span>
        <motion.span
          className="text-acid"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {String(publications.length).padStart(3, "0")} /{" "}
          {String(publications.length).padStart(3, "0")}
        </motion.span>
      </div>
    </footer>
  );
}

// ============================================================
// ResearchSection — main export
// ============================================================
export function ResearchSection() {
  return (
    <section id="research" className="relative scroll-mt-24 bg-iron">
      <SectionHeader />
      <div className="mx-auto max-w-editorial px-6 md:px-10 lg:px-16">
        {publications.map((publication, i) => (
          <PublicationBlock
            key={publication.id}
            publication={publication}
            index={i}
          />
        ))}
      </div>
      <SectionFooter />
    </section>
  );
}
