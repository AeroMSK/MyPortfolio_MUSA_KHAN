"use client";

import * as React from "react";
import { useEffect, useRef, useSyncExternalStore, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, ArrowUpRight, Github } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { ContributionDay, ContributionYear, GithubUser } from "@/lib/github";
import { getSamplePayload } from "@/lib/github-sample-data";

// ============================================================
// GITHUB ACTIVITY SECTION
//
// Renders a manually-built GitHub-style contribution calendar grid
// (7 rows × 53 columns = 371 cells) driven by /api/github.
//
// States:
//   1. loading  — skeleton grid + "LOADING ACTIVITY..." (label-mono,
//                  ash, animate-pulse).
//   2. error    — "GITHUB ACTIVITY UNAVAILABLE" banner + sample
//                  data so the layout never collapses.
//   3. success  — real data from GitHub GraphQL API.
//
// The View Profile button renders as disabled-looking with a tooltip
// when githubUrl is still a placeholder ("YOUR_GITHUB_URL").
// ============================================================

const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
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

// ---- Response shape from /api/github ----
type GithubApiResponse = {
  user: GithubUser;
  contributions: ContributionYear;
  isSample: boolean;
  error?: string;
};

// ---- Cell color by intensity level ----
function cellBgClass(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0:
      return "bg-iron/40";
    case 1:
      return "bg-acid/20";
    case 2:
      return "bg-acid/40";
    case 3:
      return "bg-acid/60";
    case 4:
      return "bg-acid";
  }
}

// ---- Format ISO date "2026-03-14" as "Mar 14, 2026" ----
function formatCellDate(iso: string): string {
  // Parse UTC-safe (avoid TZ shift)
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---- Month label row (positioned above grid columns) ----
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];

/**
 * Compute month label positions (column index where each month starts)
 * from the weeks grid. GitHub uses Sun-start weeks.
 */
function computeMonthStarts(weeks: ContributionDay[][]): Array<{
  label: string;
  colIndex: number;
}> {
  const starts: Array<{ label: string; colIndex: number }> = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    // Find the first non-null day in the week (some trailing/leading days
    // may belong to the previous month)
    const day = week.find((d) => d) ?? week[0];
    if (!day) return;
    const [y, m] = day.date.split("-").map(Number);
    if (!m) return;
    const monthIdx = m - 1;
    if (monthIdx !== lastMonth) {
      starts.push({ label: MONTH_LABELS[monthIdx] ?? "—", colIndex: colIdx });
      lastMonth = monthIdx;
    }
  });
  return starts;
}

// ============================================================
// ContributionGrid — the 7×53 cells + month labels + weekday labels
// ============================================================
// ---- Grid constants ----
// Fixed 12×12px cells with a 3px gap — keeps the layout pixel-stable
// across breakpoints. Total grid width: 53 × 12 + 52 × 3 = 792px.
// On screens narrower than that, the parent scrolls horizontally.
// We use inline styles for dimensions so Tailwind's static-class scanner
// doesn't need to see the (dynamically interpolated) px values.
const CELL_PX = 12;
const GAP_PX = 3;
const CELL_DIM_STYLE = { width: `${CELL_PX}px`, height: `${CELL_PX}px` } as const;
const GAP_STYLE = { gap: `${GAP_PX}px` } as const;
const COL_STRIDE = CELL_PX + GAP_PX;

function ContributionGrid({
  contributions,
  animate,
}: {
  contributions: ContributionYear;
  animate: boolean;
}) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const { weeks } = contributions;
  const monthStarts = computeMonthStarts(weeks);

  return (
    <div
      className="relative overflow-x-auto pb-3 scrollbar-thin"
      role="img"
      aria-label={`GitHub contribution calendar for ${contributions.year} — ${contributions.total} total contributions`}
    >
      <div className="inline-flex flex-col" style={{ minWidth: "fit-content" }}>
        {/* Month labels row */}
        <div
          className="relative mb-2 flex"
          style={{ height: "16px" }}
          aria-hidden="true"
        >
          {/* Spacer for the weekday-label gutter */}
          <div className="shrink-0" style={{ width: "28px" }} />
          {monthStarts.map((m, i) => {
            const next = monthStarts[i + 1];
            const span = next ? next.colIndex - m.colIndex : weeks.length - m.colIndex;
            return (
              <div
                key={`${m.label}-${m.colIndex}`}
                className="label-mono text-ash/70"
                style={{ width: `${span * COL_STRIDE}px` }}
              >
                {m.label}
              </div>
            );
          })}
        </div>

        {/* Main grid: weekday labels column + cell columns */}
        <div className="flex">
          {/* Weekday labels column (Mon/Wed/Fri only) */}
          <div
            className="flex shrink-0 flex-col py-[1px]"
            style={{ width: "28px", ...GAP_STYLE }}
            aria-hidden="true"
          >
            {Array.from({ length: 7 }).map((_, dayIdx) => {
              // Grid rows go Sun(top)..Sat(bottom) — matches GitHub.
              const labelIdx = [1, 3, 5].indexOf(dayIdx);
              if (labelIdx === -1) {
                return <div key={dayIdx} style={CELL_DIM_STYLE} />;
              }
              return (
                <div
                  key={dayIdx}
                  className="label-mono flex items-center text-ash/70"
                  style={CELL_DIM_STYLE}
                >
                  {WEEKDAY_LABELS[labelIdx]}
                </div>
              );
            })}
          </div>

          {/* Cells: 53 week-columns × 7 day-rows via flex-col columns */}
          <div className="flex" style={GAP_STYLE}>
            {weeks.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col" style={GAP_STYLE}>
                {week.map((day, rowIdx) => (
                  <ContributionCell
                    key={`${colIdx}-${rowIdx}`}
                    day={day}
                    animate={animate && !prefersReducedMotion}
                    delay={Math.min((colIdx * 7 + rowIdx) * 0.0015, 0.4)}
                    dimStyle={CELL_DIM_STYLE}
                    colorClass={cellBgClass(day.level)}
                  />
                ))}
                {/* Pad the last partial week so all columns are 7 tall */}
                {week.length < 7
                  ? Array.from({ length: 7 - week.length }).map((_, k) => (
                      <div key={`pad-${k}`} style={CELL_DIM_STYLE} aria-hidden="true" />
                    ))
                  : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ContributionCell — one day cell with native tooltip (title attr)
// + optional entrance animation (scale 0→1 with stagger)
// ============================================================
function ContributionCell({
  day,
  animate,
  delay,
  dimStyle,
  colorClass,
}: {
  day: ContributionDay;
  animate: boolean;
  delay: number;
  dimStyle: { width: string; height: string };
  colorClass: string;
}) {
  const tooltipText = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatCellDate(day.date)}`;

  if (!animate) {
    return (
      <div
        role="gridcell"
        aria-label={tooltipText}
        title={tooltipText}
        style={dimStyle}
        className={cn(
          colorClass,
          "rounded-[2px] transition-colors duration-200 hover:ring-1 hover:ring-acid/60"
        )}
      />
    );
  }

  return (
    <motion.div
      role="gridcell"
      aria-label={tooltipText}
      title={tooltipText}
      style={dimStyle}
      className={cn(
        colorClass,
        "rounded-[2px] transition-colors duration-200 hover:ring-1 hover:ring-acid/60"
      )}
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.3, ease: EASE.expo, delay }}
    />
  );
}

// ============================================================
// Skeleton grid — loading state placeholder
// ============================================================
function SkeletonGrid() {
  const rows = 7;
  const cols = 53;
  return (
    <div
      className="relative overflow-x-auto pb-3 scrollbar-thin"
      role="status"
      aria-label="Loading GitHub activity"
    >
      <div className="inline-flex flex-col" style={{ minWidth: "fit-content", gap: `${GAP_PX}px` }}>
        {/* Skeleton month labels */}
        <div className="mb-2 flex" style={{ height: "16px", gap: `${GAP_PX}px` }} aria-hidden="true">
          <div className="shrink-0" style={{ width: "28px" }} />
          {MONTH_LABELS.map((m, i) => (
            <div
              key={m}
              className="label-mono text-ash/30"
              style={{ width: `${4 * COL_STRIDE}px` }}
            >
              {i % 3 === 0 ? "X" : ""}
            </div>
          ))}
        </div>
        <div className="flex" style={{ gap: `${GAP_PX}px` }}>
          <div className="shrink-0" style={{ width: "28px" }} />
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col" style={{ gap: `${GAP_PX}px` }}>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                  key={`${colIdx}-${rowIdx}`}
                  className="animate-pulse rounded-[2px] bg-iron/40"
                  style={CELL_DIM_STYLE}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ViewProfileButton — links to githubUrl or renders disabled
// ============================================================
function ViewProfileButton({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  // Cast to string so .startsWith works — siteConfig.githubUrl is a literal
  // type from `as const`, which TS narrows to `never` after the equality check.
  const url = siteConfig.githubUrl as string;
  const pending = !url || url === "YOUR_GITHUB_URL" || url.startsWith("YOUR_");

  const baseBtn =
    "group relative inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300";

  if (pending) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="GitHub profile URL coming soon"
          title="GitHub profile URL coming soon"
          data-cursor-label="GO"
          className={cn(
            baseBtn,
            "cursor-not-allowed border border-border bg-transparent text-ash opacity-50"
          )}
        >
          <Github className="h-3.5 w-3.5" />
          <span>View GitHub Profile</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-sm border border-acid/30 bg-charcoal px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-acid opacity-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 group-focus-within:-translate-y-1 group-focus-within:opacity-100"
        >
          Profile URL coming soon
        </span>
      </div>
    );
  }

  return (
    <motion.a
      href={siteConfig.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="GO"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      className={cn(baseBtn, "bg-acid text-ink hover:bg-acid-soft")}
    >
      <Github className="h-3.5 w-3.5" />
      <span>View GitHub Profile</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}

// ============================================================
// GithubSection — main client component
// ============================================================
export function GithubSection() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Grid scale-in as user scrolls into view (0.92 → 1 across first 30%)
  const gridScale = useTransform(scrollYProgress, [0, 0.3], [0.92, 1]);

  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [data, setData] = useState<{
    user: GithubUser;
    contributions: ContributionYear;
    isSample: boolean;
    errorKind?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/github", { cache: "no-store" });
        if (!res.ok) {
          // Fall back to local sample data
          const sample = getSamplePayload();
          if (cancelled) return;
          setData({ ...sample, isSample: true, errorKind: "HTTP_ERROR" });
          setStatus("error");
          return;
        }

        const json = (await res.json()) as GithubApiResponse;
        if (!json.user || !json.contributions) {
          const sample = getSamplePayload();
          if (cancelled) return;
          setData({ ...sample, isSample: true, errorKind: "MALFORMED" });
          setStatus("error");
          return;
        }

        if (cancelled) return;
        setData({
          user: json.user,
          contributions: json.contributions,
          isSample: json.isSample,
          errorKind: json.error,
        });

        // "PLACEHOLDER_USERNAME" sample is expected behaviour, not an error.
        // Any other errorKind (USER_NOT_FOUND, NO_TOKEN, FETCH_FAILED) shows
        // the "GITHUB ACTIVITY UNAVAILABLE" banner.
        if (json.isSample && json.error && json.error !== "PLACEHOLDER_USERNAME") {
          setStatus("error");
        } else {
          setStatus("success");
        }
      } catch {
        // Network / fetch failure
        const sample = getSamplePayload();
        if (cancelled) return;
        setData({ ...sample, isSample: true, errorKind: "NETWORK_ERROR" });
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = data?.contributions.total ?? 0;
  const year = data?.contributions.year ?? new Date().getFullYear();
  const isPlaceholder = data?.errorKind === "PLACEHOLDER_USERNAME";

  return (
    <section
      id="github-activity"
      ref={sectionRef}
      className="relative scroll-mt-24 border-t border-border bg-ink"
    >
      <div className="mx-auto max-w-editorial px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        {/* Section header */}
        <header className="border-b border-border pb-10 md:pb-14">
          <motion.div
            className="label-mono flex flex-wrap items-center gap-x-4 gap-y-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE.expo }}
          >
            <span className="flex items-center gap-2 text-acid">
              <Activity className="h-3.5 w-3.5" />
              GITHUB ACTIVITY
            </span>
            <span className="text-ash/30">—</span>
            <span className="text-ash">CONTRIBUTION CALENDAR</span>
            <span className="text-ash/30">—</span>
            <span className="text-ash">{year}</span>
          </motion.div>

          <motion.h2
            className="mt-6 font-display font-bold uppercase tracking-tightest text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] text-paper"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE.expo, delay: 0.1 }}
          >
            GitHub Activity
          </motion.h2>

          <motion.p
            className="mt-6 max-w-prose text-base leading-relaxed text-paper/70 md:text-lg"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE.expo, delay: 0.3 }}
          >
            A live snapshot of public contributions across the last 12 months —
            commits, pull requests, issues, and reviews pushed to GitHub.
          </motion.p>
        </header>

        {/* Main content: grid + summary */}
        <div className="mt-10 md:mt-14">
          {/* Loading state */}
          {status === "loading" ? (
            <div className="space-y-6">
              <p className="label-mono animate-pulse text-ash">
                LOADING ACTIVITY…
              </p>
              <SkeletonGrid />
            </div>
          ) : data ? (
            <motion.div
              style={{ scale: prefersReducedMotion ? 1 : gridScale }}
              className="space-y-6"
            >
              {/* Error / unavailable banner */}
              {status === "error" && !isPlaceholder ? (
                <div
                  role="alert"
                  className="flex flex-col gap-1 border border-amber-400/30 bg-amber-400/5 px-4 py-3"
                >
                  <span className="label-mono text-amber-400">
                    GITHUB ACTIVITY CURRENTLY UNAVAILABLE
                  </span>
                  <span className="label-mono text-ash">
                    — UNDER WORKING
                  </span>
                </div>
              ) : null}

              {/* Sample-data badge (only when placeholder username) */}
              {data.isSample && isPlaceholder ? (
                <div className="flex flex-col gap-1 border border-border bg-graphite/60 px-4 py-3">
                  <span className="label-mono text-ash">
                    GITHUB ACTIVITY CURRENTLY UNAVAILABLE
                  </span>
                  <span className="label-mono text-acid">
                    — UNDER WORKING
                  </span>
                </div>
              ) : null}

              {/* User identity strip */}
              <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-graphite">
                  {data.user.avatarUrl ? (
                    <img
                      src={data.user.avatarUrl}
                      alt={`${data.user.login} GitHub avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Github className="h-5 w-5 text-ash" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold tracking-tight text-paper">
                    {data.user.name ?? data.user.login}
                  </div>
                  <div className="label-mono text-ash">
                    @{data.user.login}
                    {data.user.bio ? <span className="ml-2 text-ash/60">— {data.user.bio}</span> : null}
                  </div>
                </div>
                <div className="label-mono hidden gap-6 text-right sm:flex">
                  <div>
                    <div className="text-acid">{data.user.publicRepos}</div>
                    <div className="text-ash">REPOS</div>
                  </div>
                </div>
              </div>

              {/* Contribution grid */}
              <ContributionGrid
                contributions={data.contributions}
                animate={status === "success"}
              />

              {/* Legend */}
              <div className="label-mono flex flex-wrap items-center justify-end gap-2 text-ash">
                <span>LESS</span>
                <div className="flex items-center gap-[3px]">
                  <div className={cn("h-[10px] w-[10px] rounded-[2px]", cellBgClass(0))} />
                  <div className={cn("h-[10px] w-[10px] rounded-[2px]", cellBgClass(1))} />
                  <div className={cn("h-[10px] w-[10px] rounded-[2px]", cellBgClass(2))} />
                  <div className={cn("h-[10px] w-[10px] rounded-[2px]", cellBgClass(3))} />
                  <div className={cn("h-[10px] w-[10px] rounded-[2px]", cellBgClass(4))} />
                </div>
                <span>MORE</span>
              </div>

              {/* Summary: TOTAL CONTRIBUTIONS + YEAR + View Profile */}
              <div className="grid grid-cols-12 items-end gap-6 border-t border-border pt-10 md:gap-10">
                {/* Total contributions (big number) */}
                <motion.div
                  className="col-span-12 md:col-span-7"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: EASE.expo }}
                >
                  <div className="label-mono mb-3 text-ash">
                    TOTAL CONTRIBUTIONS · {year}
                  </div>
                  <div className="flex items-baseline gap-4">
                    <div className="font-display font-bold leading-none text-[clamp(3rem,7vw,5rem)] text-paper">
                      {total.toLocaleString("en-US")}
                    </div>
                    <div className="label-mono text-acid">
                      {data.isSample ? "SAMPLE" : "LIVE"}
                    </div>
                  </div>
                </motion.div>

                {/* View profile */}
                <div className="col-span-12 flex justify-start md:col-span-5 md:justify-end">
                  <ViewProfileButton prefersReducedMotion={prefersReducedMotion} />
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
