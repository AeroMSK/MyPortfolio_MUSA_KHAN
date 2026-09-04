"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorState = {
  active: boolean;
  label: string | null;
};

// SSR-safe store for fine-pointer (desktop) detection
const finePointerStore = {
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  getSnapshot() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  },
  getServerSnapshot() {
    return false;
  },
};

/**
 * CustomCursor — premium desktop cursor.
 * - Default: small dot
 * - Hover interactive elements: expanding circle with optional label (VIEW, OPEN, GO, etc.)
 * - Auto-hides on touch devices.
 */
export function CustomCursor() {
  const enabled = useSyncExternalStore(
    finePointerStore.subscribe,
    finePointerStore.getSnapshot,
    finePointerStore.getServerSnapshot,
  );
  const [state, setState] = useState<CursorState>({ active: false, label: null });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // High stiffness + low mass = near-instant tracking (feels like native cursor)
  // Dot follows almost 1:1 with mouse, ring has slight trailing for the premium feel
  const dotX = useSpring(x, { stiffness: 2000, damping: 80, mass: 0.1 });
  const dotY = useSpring(y, { stiffness: 2000, damping: 80, mass: 0.1 });
  const ringX = useSpring(x, { stiffness: 800, damping: 40, mass: 0.2 });
  const ringY = useSpring(y, { stiffness: 800, damping: 40, mass: 0.2 });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cursor-none-desktop");

    const move = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      });

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [data-cursor], [role="button"], input, textarea, select, summary, [data-cursor-label]',
      ) as HTMLElement | null;

      if (interactive) {
        const label =
          interactive.getAttribute("data-cursor-label") ||
          (interactive.tagName === "A" && "OPEN") ||
          (interactive.tagName === "BUTTON" && "GO") ||
          null;
        setState({ active: true, label });
      } else {
        setState({ active: false, label: null });
      }
    };

    const leave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("cursor-none-desktop");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      {/* Inner dot */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full bg-acid"
          animate={{
            width: state.active ? 6 : 8,
            height: state.active ? 6 : 8,
            opacity: state.active ? 1 : 0.9,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full border border-acid/70 flex items-center justify-center"
          animate={{
            width: state.active ? 72 : 32,
            height: state.active ? 72 : 32,
            backgroundColor: state.active
              ? "rgba(196,245,66,0.10)"
              : "rgba(196,245,66,0)",
            borderColor: state.active
              ? "rgba(196,245,66,0.85)"
              : "rgba(196,245,66,0.55)",
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {state.label && (
            <motion.span
              key={state.label}
              className="font-mono text-[9px] tracking-label uppercase text-acid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {state.label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
