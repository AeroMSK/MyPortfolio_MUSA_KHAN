"use client";

import { useEffect } from "react";

/**
 * VisibilityGuard — guarantees content is always visible.
 *
 * Problem:
 *   Framer Motion sets `opacity: 0` inline when an element has
 *   `initial={{ opacity: 0 }}` and waits for `whileInView` to fire.
 *   If IntersectionObserver doesn't fire reliably (Lenis smooth-scroll
 *   interference, backgrounded tab, hydration race, browser throttle),
 *   content stays invisible forever.
 *
 * Solution:
 *   This component sets up its own IntersectionObserver that watches the
 *   whole document. When any element with inline `opacity: 0` enters the
 *   viewport, we force its opacity to 1 by setting an inline style override.
 *   This is independent of Framer Motion's internal IO setup, so it works
 *   even when Lenis interferes with the native scroll event.
 *
 *   We also re-run a check on every scroll/resize/load event as a
 *   belt-and-suspenders fallback.
 */
export function VisibilityGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const FORCE_VISIBLE_DELAY_MS = 1500; // grace period for Framer Motion to animate
    const mountTime = Date.now();

    /**
     * Find all elements with computed opacity < 0.05 that are currently
     * in the viewport AND have been on screen long enough that Framer Motion
     * should have animated them by now. Force them visible.
     */
    function forceVisibleInViewport() {
      // Only act after the grace period
      if (Date.now() - mountTime < FORCE_VISIBLE_DELAY_MS) return;

      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      const candidates = document.querySelectorAll<HTMLElement>(
        // Common container tags used by the portfolio
        "section *, footer *, article, header, h2, h3, p, ul, li, figure, blockquote",
      );

      let fixed = 0;
      for (const el of candidates) {
        const cs = getComputedStyle(el);
        // Skip if already visible
        if (parseFloat(cs.opacity) >= 0.05) continue;

        const r = el.getBoundingClientRect();
        // Skip if element is not in viewport
        if (r.bottom < 0 || r.top > viewportH || r.right < 0 || r.left > viewportW) continue;

        // Skip if element has zero size (likely hidden intentionally)
        if (r.width < 2 || r.height < 2) continue;

        // Skip elements inside the loader (z-[100]) or cursor (z-[200])
        const parentLoader = el.closest('[class*="z-[100]"], [class*="z-[200]"]');
        if (parentLoader) continue;

        // Skip the PageLoader (which intentionally hides via opacity)
        if (el.id === "page-loader") continue;

        // Skip elements with `aria-hidden="true"` (intentionally hidden)
        if (el.getAttribute("aria-hidden") === "true") continue;

        // Skip if element is descendant of a `[hidden]` or `display: none` parent
        if (cs.display === "none" || cs.visibility === "hidden") continue;

        // Force visible — but only override inline opacity, not class-based.
        // Framer Motion sets opacity via inline style, so we override inline.
        if (el.style.opacity === "0" || el.style.opacity === "") {
          el.style.setProperty("opacity", "1", "important");
          fixed++;
        }
      }

      if (fixed > 0 && process.env.NODE_ENV !== "production") {
        console.debug(`[VisibilityGuard] forced ${fixed} stuck elements visible`);
      }
    }

    // Initial check after grace period
    const initialTimer = setTimeout(forceVisibleInViewport, FORCE_VISIBLE_DELAY_MS + 200);

    // Re-check on scroll (Lenis uses native scroll events too, but this catches all cases)
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        forceVisibleInViewport();
      });
    };

    // Re-check on resize (in case layout shifts bring new elements into view)
    const onResize = () => forceVisibleInViewport();

    // Use IntersectionObserver as the primary trigger — fires when elements enter viewport
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Element just entered viewport — check after a tiny delay
            setTimeout(() => forceVisibleInViewport(), 50);
          }
        }
      },
      { rootMargin: "100px 0px 100px 0px", threshold: 0 },
    );

    // Observe the whole document body — IO will fire for any descendant visibility changes
    io.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Periodic re-check (every 2 seconds for the first 10 seconds) — catches
    // any elements that get added dynamically or that we missed
    const intervalTimers: ReturnType<typeof setTimeout>[] = [];
    for (let delay = 2500; delay <= 10000; delay += 2000) {
      intervalTimers.push(setTimeout(forceVisibleInViewport, delay));
    }

    return () => {
      clearTimeout(initialTimer);
      intervalTimers.forEach(clearTimeout);
      cancelAnimationFrame(scrollRaf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
