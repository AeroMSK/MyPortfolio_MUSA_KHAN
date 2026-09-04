"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — renderless component wrapping the app with Lenis.
 *
 * IMPORTANT: Even when prefers-reduced-motion is enabled, we STILL initialize
 * Lenis. Without Lenis, the native scroll on some browsers (especially Windows
 * with Edge/Chrome) may not fire scroll events that Framer Motion's useScroll
 * depends on, causing animations to not work at all.
 *
 * When prefers-reduced-motion is enabled, we use Lenis with:
 * - duration: 0 (near-instant, no smoothing)
 * - smoothWheel: false (native wheel behavior)
 * This ensures scroll events fire properly while respecting the user's preference.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = new Lenis({
      // When reduced motion, use minimal duration (effectively native scroll)
      // but still initialize Lenis so scroll events fire properly
      duration: prefersReducedMotion ? 0.1 : 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: 2,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Anchor link smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: prefersReducedMotion ? 0.3 : 1.4 });
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
