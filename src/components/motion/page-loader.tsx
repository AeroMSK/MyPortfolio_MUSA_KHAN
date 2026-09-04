"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SSR-safe reduced-motion store
const reducedMotionStore = {
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  getSnapshot() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
  getServerSnapshot() {
    return false;
  },
};

/**
 * PageLoader — cinematic 1-2s loading sequence.
 * Shows name, progress, and index metadata. Respects reduced-motion (skips entirely).
 *
 * Bug fix (V3): Previously, when prefersReducedMotion was TRUE on the client
 * (but FALSE on the server during SSR), the initial state was progress=0/done=false
 * and the useEffect returned early — leaving the loader stuck at 0% forever.
 *
 * Fix: derive `done` from `prefersReducedMotion || animationDone` so that
 * reduced-motion users see the loader disappear immediately after hydration,
 * without depending on a setState call inside the effect.
 */
export function PageLoader() {
  const prefersReducedMotion = useSyncExternalStore(
    reducedMotionStore.subscribe,
    reducedMotionStore.getSnapshot,
    reducedMotionStore.getServerSnapshot,
  );

  // progress + animationDone are only meaningful for non-reduced-motion users.
  // For reduced-motion users, `done` is forced to true via the derived value
  // below — so the loader never renders.
  const [progress, setProgress] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);

  // Derived: loader is "done" if either (a) user prefers reduced motion (skip
  // animation entirely) OR (b) the rAF progress animation has completed.
  const done = prefersReducedMotion || animationDone;

  useEffect(() => {
    if (prefersReducedMotion) {
      // No animation — derived `done` is already true. Nothing to do.
      return;
    }

    const start = performance.now();
    const duration = 1400; // ms

    let rafId = 0;
    let completeTimer: ReturnType<typeof setTimeout> | null = null;
    // Safety net: if rAF doesn't fire for any reason (backgrounded tab,
    // throttled timer, browser bug), force-complete after 3 seconds so the
    // loader never gets stuck.
    const safetyNet = setTimeout(() => setAnimationDone(true), 3000);

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        completeTimer = setTimeout(() => setAnimationDone(true), 350);
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (completeTimer) clearTimeout(completeTimer);
      clearTimeout(safetyNet);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.85, 0, 0.15, 1] }}
        >
          {/* Top metadata */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono text-[10px] tracking-label uppercase text-ash/60">
            <span>MK · Portfolio</span>
            <span>2026 / INDEX 001</span>
          </div>

          {/* Center: Name reveal */}
          <div className="flex flex-col items-center gap-4 px-6">
            <motion.div
              className="font-mono text-[10px] tracking-label uppercase text-acid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Loading Workspace
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                className="font-display text-display-md font-bold uppercase tracking-tightest text-paper text-center"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                MUSA KHAN
              </motion.h1>
            </div>

            <motion.p
              className="font-mono text-[11px] tracking-label uppercase text-ash/70 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Developer · Researcher · Creative Technologist
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="px-6 pb-4 flex items-center justify-between font-mono text-[10px] tracking-label uppercase text-ash/60">
              <span>CTG / BD</span>
              <span>{progress.toString().padStart(3, "0")}%</span>
            </div>
            <div className="h-[2px] bg-iron/60 relative overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-acid"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
