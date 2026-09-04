"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================
// TextReveal
// Per-character or per-word color transition as the user scrolls past text.
// Modeled after the Amplytic ScrollReveal.jsx pattern (gray → paper).
// ============================================================

const INACTIVE_COLOR = "#5c5c5c"; // muted gray
const ACTIVE_COLOR = "#EAEAEA"; // paper

export interface TextRevealProps {
  text: string;
  /** Tag to render as (default "p") */
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div";
  /** Additional className applied to the wrapper */
  className?: string;
  /** Transition granularity — "char" reveals per character, "word" per word */
  mode?: "char" | "word";
  /**
   * Optional external scroll progress MotionValue (0 → 1).
   * When provided, the color transition uses THIS value instead of the
   * element's own useScroll. This is needed for elements inside sticky
   * containers where the element's position relative to the viewport
   * doesn't change while pinned (so useScroll would get stuck).
   */
  progress?: MotionValue<number>;
}

// ---- Single character with a sub-range of scroll progress mapped to color ----
function Char({
  char,
  start,
  end,
  progress,
}: {
  char: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const color = useTransform(progress, [start, end], [
    INACTIVE_COLOR,
    ACTIVE_COLOR,
  ]);
  if (char === " ") return <span>&nbsp;</span>;
  return <motion.span style={{ color }}>{char}</motion.span>;
}

// ---- Single word (char mode: each character gets a sub-range) ----
function CharWord({
  word,
  start,
  end,
  progress,
}: {
  word: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const chars = word.split("");
  const step = (end - start) / Math.max(1, chars.length);
  return (
    <motion.span>
      {chars.map((ch, idx) => (
        <Char
          key={idx}
          char={ch}
          start={start + step * idx}
          end={start + step * (idx + 1)}
          progress={progress}
        />
      ))}
      <span>&nbsp;</span>
    </motion.span>
  );
}

// ---- Single word (word mode: whole word transitions together) ----
function WholeWord({
  word,
  start,
  end,
  progress,
}: {
  word: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const color = useTransform(progress, [start, end], [
    INACTIVE_COLOR,
    ACTIVE_COLOR,
  ]);
  return (
    <motion.span style={{ color }}>
      {word}
      <span>&nbsp;</span>
    </motion.span>
  );
}

// ---- Motion tag lookup ----
const motionTagMap = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  span: motion.span,
  div: motion.div,
} as const;

export function TextReveal({
  text,
  as = "p",
  className,
  mode = "word",
  progress,
}: TextRevealProps) {
  // Ref is typed as HTMLElement so it satisfies useScroll's target requirement
  // regardless of the chosen motion tag (p / h2 / span / etc.).
  const ref = React.useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // useScroll on the wrapper element so the text transitions as it scrolls through
  // ONLY used when no external progress is provided. When progress is provided
  // (e.g., from a parent sticky card's useScroll), use that instead — this is
  // needed because sticky elements don't change position while pinned, so their
  // own useScroll would get stuck.
  const { scrollYProgress: ownScrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.4"],
  });

  const scrollProgress = progress ?? ownScrollYProgress;

  const words = React.useMemo(() => text.split(" "), [text]);
  const totalWords = words.length;

  // Reduced motion: render the text statically with the active (paper) color
  if (prefersReducedMotion) {
    const Tag = as as React.ElementType;
    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={cn("text-paper", className)}
      >
        {text}
      </Tag>
    );
  }

  // Cast to a common motion tag type so the ref type is consistent across tags.
  // At runtime, motionTagMap[as] still renders the correct tag (p / h2 / span / …).
  const MotionTag = motionTagMap[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("flex flex-wrap", className)}
    >
      {words.map((word, idx) => {
        const start = idx / totalWords;
        const end = (idx + 1) / totalWords;
        return mode === "char" ? (
          <CharWord
            key={idx}
            word={word}
            start={start}
            end={end}
            progress={scrollProgress}
          />
        ) : (
          <WholeWord
            key={idx}
            word={word}
            start={start}
            end={end}
            progress={scrollProgress}
          />
        );
      })}
    </MotionTag>
  );
}
