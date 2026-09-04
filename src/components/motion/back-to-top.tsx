"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// BackToTop
// Floating button that fades in after the user scrolls past SHOW_AFTER px
// and smooth-scrolls to the top on click.
// ============================================================

const SHOW_AFTER = 600; // px
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

// Lenis is loaded by smooth-scroll.tsx but not exposed on window by default.
// We declare a minimal shape so we can use it if a future agent exposes it.
type LenisLike = {
  scrollTo: (target: number | HTMLElement, opts?: { duration?: number; offset?: number }) => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

export function BackToTop() {
  const [visible, setVisible] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    let ticking = false;
    const update = () => {
      setVisible(
        (window.scrollY ?? window.pageYOffset ?? 0) > SHOW_AFTER
      );
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check (in case we land mid-page)
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = React.useCallback(() => {
    // 1. Prefer Lenis if exposed on window
    if (typeof window !== "undefined" && window.__lenis) {
      try {
        window.__lenis.scrollTo(0, { duration: 1.2 });
        return;
      } catch {
        // fall through to next strategy
      }
    }

    // 2. Synthesize a click on an in-page anchor to leverage smooth-scroll.tsx
    //    (smooth-scroll.tsx intercepts anchor clicks → lenis.scrollTo(target, { offset: -80 }))
    if (
      typeof document !== "undefined" &&
      !prefersReducedMotion &&
      document.getElementById("hero")
    ) {
      const link = document.createElement("a");
      link.setAttribute("href", "#hero");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 3. Fallback: native smooth (or instant under reduced motion)
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Scroll back to top"
          data-cursor-label="TOP"
          className={cn(
            "fixed bottom-6 right-6 z-40",
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-graphite/80 backdrop-blur-md border border-border",
            "text-paper transition-colors duration-300",
            "hover:bg-acid hover:text-ink hover:border-acid",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          )}
          initial={
            prefersReducedMotion ? false : { opacity: 0, scale: 0.6, y: 16 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.6, y: 16 }
          }
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: EASE_EXPO }}
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
