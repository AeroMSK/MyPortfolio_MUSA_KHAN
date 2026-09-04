/**
 * GitHub sample data — deterministic fallback used by:
 *   1. /api/github route when the username is still a placeholder
 *      ("YOUR_GITHUB_USERNAME") OR when the real GitHub API call fails.
 *   2. The client <GithubSection/> component on hard fetch failure
 *      (network error / non-JSON response) so the layout never collapses.
 *
 * Determinism: uses a seeded PRNG (mulberry32) so the same sample calendar
 * is generated on every request — keeps SSR→client payload stable and
 * makes the "year view" feel like a real, lived-in contribution graph.
 */

import type {
  ContributionDay,
  ContributionYear,
  GithubUser,
} from "@/lib/github";

// ---- Level mapping (shared with real-data path) ----
// 0: no contributions
// 1: 1–3
// 2: 4–6
// 3: 7–9
// 4: 10+
export function levelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

// ---- Seeded PRNG (mulberry32) ----
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Sample user (matches Musa Khan's real persona) ----
export const SAMPLE_USER: GithubUser = {
  login: "AeroMSK",
  name: "Musa Khan",
  avatarUrl: "https://avatars.githubusercontent.com/u/187884754?v=4",
  bio: "Developer · Researcher · Creative Technologist. CSE @ IIUC. Building software, researching systems, experimenting with motion & sound.",
  followers: 2,
  following: 3,
  publicRepos: 12,
};

/**
 * Build a deterministic 53-week (371-day) sample contribution calendar
 * ending today. Bias toward weekdays (Tue–Thu more commits).
 *
 * Distribution target:
 *   - ~40% of days have zero contributions (60% avg activity)
 *   - Mid-week days have higher counts (real dev rhythm)
 *   - Weekends are quiet (~0.2× of weekday activity)
 *   - Total lands in 700–1200 range (active but not superhuman)
 */
export function generateSampleContributions(
  referenceDate: Date = new Date()
): ContributionYear {
  const rand = mulberry32(0x9e3779b1);

  // End = today (truncated to UTC midnight for stable day math)
  const end = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  );

  // Start = Sunday at least 52 weeks (364 days) before end so we have
  // ~53 weeks in the grid. JS getDay: 0=Sun .. 6=Sat.
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // walk back to Sunday
  start.setUTCDate(start.getUTCDate() - 7 * 52); // another 52 weeks back

  // Per-weekday bias (Sun..Sat)
  const weekdayBias = [0.15, 0.85, 1.0, 1.0, 0.95, 0.55, 0.2];

  const weeks: ContributionDay[][] = [];
  let total = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const isoDate = cursor.toISOString().slice(0, 10);
      const dayOfWeek = cursor.getUTCDay();

      // Decide whether this is a contribution day (~60% of days)
      const r = rand();
      let count = 0;
      if (r > 0.40) {
        // Non-zero day — choose a magnitude band
        const intensity = rand();
        if (intensity < 0.5) {
          // 1–3 (low)
          count = 1 + Math.floor(rand() * 3);
        } else if (intensity < 0.8) {
          // 4–6 (medium)
          count = 4 + Math.floor(rand() * 3);
        } else {
          // 7–12 (high)
          count = 7 + Math.floor(rand() * 6);
        }
        // Dampen on weekends so weekends stay quiet
        count = Math.max(0, Math.round(count * weekdayBias[dayOfWeek]));
      }

      total += count;
      week.push({
        date: isoDate,
        count,
        level: levelForCount(count),
      });

      // Advance cursor
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      if (cursor > end) break;
    }
    weeks.push(week);
  }

  return {
    year: end.getUTCFullYear(),
    total,
    weeks,
  };
}

/**
 * Convenience helper — used by the API route and by the client when the
 * network call to /api/github itself fails (rare but possible).
 */
export function getSamplePayload(referenceDate: Date = new Date()) {
  return {
    user: SAMPLE_USER,
    contributions: generateSampleContributions(referenceDate),
  };
}
