"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================
// MagneticButton
// A button (or anchor) that's attracted to the cursor on hover.
// Translates up to MAX_OFFSET px toward the cursor, springs back on leave.
// ============================================================

const DEFAULT_STRENGTH = 0.4; // 40% of cursor offset
const DEFAULT_MAX_OFFSET = 12; // px cap

type CommonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  /** Cursor label shown by the custom cursor on hover (defaults to "GO") */
  cursorLabel?: string;
  /** 0..1 — how strongly the button follows the cursor */
  strength?: number;
  /** px — max translation in either axis */
  maxOffset?: number;
  /** Disable magnetic behaviour entirely (still renders as a styled button) */
  disabled?: boolean;
  /** Render as anchor target=_blank rel=noopener (only valid with href) */
  external?: boolean;
};

type AnchorOnlyProps = HTMLMotionProps<"a"> & CommonProps;
type ButtonOnlyProps = HTMLMotionProps<"button"> & CommonProps;
export type MagneticButtonProps = AnchorOnlyProps | ButtonOnlyProps;

export function MagneticButton(props: MagneticButtonProps) {
  const {
    children,
    href,
    onClick,
    className,
    cursorLabel = "GO",
    strength = DEFAULT_STRENGTH,
    maxOffset = DEFAULT_MAX_OFFSET,
    disabled = false,
    external = false,
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 16, mass: 0.4 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  // useReducedMotion is SSR-safe (returns false on server) and reactive.
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion || disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Clamp to maxOffset so the button never wanders too far
      const tx = Math.max(-maxOffset, Math.min(maxOffset, dx * strength));
      const ty = Math.max(-maxOffset, Math.min(maxOffset, dy * strength));
      x.set(tx);
      y.set(ty);
    },
    [prefersReducedMotion, disabled, maxOffset, strength, x, y]
  );

  const handleMouseLeave = React.useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const baseClass = cn(
    "group relative inline-flex select-none items-center justify-center gap-2",
    "rounded-full px-5 py-2.5",
    "font-mono text-[11px] font-medium uppercase tracking-[0.18em]",
    "bg-transparent text-paper border border-acid/40",
    "transition-colors duration-300",
    "hover:border-acid hover:bg-acid hover:text-ink",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
    disabled &&
      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-paper hover:border-acid/40",
    className
  );

  const motionStyle = prefersReducedMotion ? undefined : { x: sx, y: sy };

  if (href && !disabled) {
    const anchorRest = rest as Partial<HTMLMotionProps<"a">>;
    return (
      <motion.a
        href={href}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-cursor-label={cursorLabel}
        className={baseClass}
        style={motionStyle}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorRest}
      >
        {children}
      </motion.a>
    );
  }

  const buttonRest = rest as Partial<HTMLMotionProps<"button">>;
  return (
    <motion.button
      type="button"
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-label={cursorLabel}
      disabled={disabled}
      className={baseClass}
      style={motionStyle}
      {...buttonRest}
    >
      {children}
    </motion.button>
  );
}

