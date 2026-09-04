"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Download } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  activeSection?: string;
}

/* ── Easings (premium feel — must match design system) ─────────────── */
const EASE = {
  expo: [0.16, 1, 0.3, 1] as const, // expo-out
  power4Out: [0.19, 1, 0.22, 1] as const,
  power3In: [0.755, 0.05, 0.855, 0.06] as const, // power3.in
  circOut: [0.075, 0.82, 0.165, 1] as const,
};

/**
 * usePrefersReducedMotion — subscribes to the user's reduced-motion preference
 * via useSyncExternalStore. Safe for SSR (returns false on the server).
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = () => onChange();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    () => false, // SSR snapshot
  );
}

/* ── Animation variants ────────────────────────────────────────────── */

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const preLayerVariants = (
  delay: number,
): Variants => ({
  hidden: { x: "100%" },
  visible: {
    x: "0%",
    transition: { duration: 0.6, ease: EASE.power4Out, delay },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.38, ease: EASE.power3In, delay: delay * 0.5 },
  },
});

const panelVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: "0%",
    transition: { duration: 0.6, ease: EASE.power4Out, delay: 0.16 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.4, ease: EASE.power3In },
  },
};

const topBarVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.32 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * MobileMenu — fullscreen cinematic overlay for <768px.
 *
 * Choreography (open):
 *   1. Backdrop fades in (200ms)
 *   2. Two coloured pre-layers (acid + ash) slide in from right (staggered 100ms)
 *   3. Main panel slides in (delay 160ms)
 *   4. Nav links stagger in from below (yPercent 130 → 0, 90ms stagger, expo ease)
 *   5. CV button + metadata fade in last
 *
 * Close: reverse, ease power3.in.
 *
 * Accessibility:
 *   - role="dialog" aria-modal="true"
 *   - Focus trap inside overlay
 *   - Escape closes (also handled by parent Navbar)
 *   - Clicking backdrop closes
 */
export function MobileMenu({ open, onClose, activeSection }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  /* ── Reduced motion detection (via useSyncExternalStore) ────────── */
  const prefersReducedMotion = usePrefersReducedMotion();

  /* ── Focus trap + initial focus ────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Focus the close button initially so screen reader users know where they are.
    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 320);

    const getFocusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getFocusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      panel.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* ── Close handlers ────────────────────────────────────────────── */
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close when clicking the backdrop itself, not its children.
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation menu"
          className="fixed inset-0 z-[150] md:hidden"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop — ink, fades in */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink cursor-pointer"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          />

          {/* Pre-layer 1 — acid (slides from right) */}
          <motion.div
            aria-hidden
            className="absolute top-0 right-0 h-full w-[40%] max-w-[280px] bg-acid"
            variants={preLayerVariants(0)}
          />

          {/* Pre-layer 2 — ash (slides from right, slight delay) */}
          <motion.div
            aria-hidden
            className="absolute top-0 right-0 h-full w-[16%] max-w-[120px] bg-ash"
            variants={preLayerVariants(0.1)}
          />

          {/* Main panel */}
          <motion.div
            ref={panelRef}
            className="absolute inset-0 bg-ink/96 backdrop-blur-xl flex flex-col"
            variants={panelVariants}
          >
            {/* ── Top bar: wordmark + close ──────────────────────── */}
            <motion.div
              variants={topBarVariants}
              className="flex items-center justify-between px-6 h-20 border-b border-border"
            >
              <Link
                href="#hero"
                onClick={handleClose}
                data-cursor-label="GO"
                aria-label="Musa Khan — back to top"
                className="font-display font-bold tracking-tightest text-paper text-[15px] uppercase"
              >
                Musa Khan
              </Link>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                aria-label="Close menu"
                data-cursor-label="CLOSE"
                className="group relative inline-flex items-center justify-center w-10 h-10 -mr-2 text-paper hover:text-acid transition-colors duration-300"
              >
                <span className="relative block w-6 h-6">
                  <motion.span
                    className="absolute top-1/2 left-0 w-full h-[1.5px] bg-current rounded-full"
                    style={{ originY: 0.5 }}
                    initial={{ rotate: 0, y: -4 }}
                    animate={{ rotate: 45, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EASE.power4Out,
                      delay: 0.32,
                    }}
                  />
                  <motion.span
                    className="absolute top-1/2 left-0 w-full h-[1.5px] bg-current rounded-full"
                    style={{ originY: 0.5 }}
                    initial={{ rotate: 0, y: 4 }}
                    animate={{ rotate: -45, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EASE.power4Out,
                      delay: 0.32,
                    }}
                  />
                </span>
              </button>
            </motion.div>

            {/* ── Nav links ──────────────────────────────────────── */}
            <nav
              aria-label="Mobile primary"
              className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 py-8 sm:py-10"
            >
              <ul className="flex flex-col gap-1">
                {siteConfig.nav.map((item, idx) => {
                  const id = item.href.replace(/^#/, "");
                  const isActive = activeSection === id;
                  // Stagger, but collapse to ~0 if reduced motion is preferred.
                  const stagger = prefersReducedMotion ? 0 : 0.09;
                  const baseDelay = prefersReducedMotion ? 0.1 : 0.32;
                  const itemDelay = baseDelay + idx * stagger;

                  return (
                    <li
                      key={item.href}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { y: "130%", opacity: 0 },
                          visible: {
                            y: "0%",
                            opacity: 1,
                            transition: {
                              duration: prefersReducedMotion ? 0.2 : 0.85,
                              ease: EASE.expo,
                              delay: itemDelay,
                            },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          data-cursor-label="GO"
                          aria-current={isActive ? "true" : undefined}
                          className="group flex items-baseline gap-3 py-3"
                        >
                          <span
                            className={cn(
                              "font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-300 self-start mt-3",
                              isActive
                                ? "text-acid"
                                : "text-ash/60 group-hover:text-acid",
                            )}
                          >
                            {item.index}
                          </span>
                          <span
                            className={cn(
                              "font-display font-bold uppercase tracking-tightest leading-[0.9] text-[clamp(2.5rem,11vw,4.75rem)] transition-colors duration-300",
                              isActive
                                ? "text-acid"
                                : "text-paper group-hover:text-acid",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Bottom: CV + metadata ─────────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: prefersReducedMotion ? 0.2 : 0.5,
                    ease: EASE.expo,
                    delay: prefersReducedMotion
                      ? 0.15
                      : 0.32 + siteConfig.nav.length * 0.09 + 0.1,
                  },
                },
              }}
              className="px-6 pb-8 pt-5 border-t border-border"
            >
              {/* Metadata row — location / email / year */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="label-mono">Location</span>
                  <span className="font-mono text-[11px] text-paper/80 uppercase tracking-[0.12em] leading-tight">
                    {siteConfig.locationShort}
                  </span>
                </div>
                <a
                  href={`mailto:${siteConfig.email}`}
                  onClick={handleClose}
                  data-cursor-label="EMAIL"
                  className="flex flex-col gap-1.5 items-center text-center"
                >
                  <span className="label-mono">Email</span>
                  <span className="font-mono text-[11px] text-paper/80 hover:text-acid transition-colors duration-300 leading-tight break-all">
                    {siteConfig.email}
                  </span>
                </a>
                <div className="flex flex-col gap-1.5 items-end">
                  <span className="label-mono">Year</span>
                  <span className="font-mono text-[11px] text-paper/80 uppercase tracking-[0.12em] leading-tight">
                    {siteConfig.year}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
