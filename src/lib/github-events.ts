/**
 * Fetch GitHub contributions from the public events API (no token needed).
 * 
 * The GraphQL contributions API requires a token, but the REST events API
 * is public and gives us ~90 days of recent activity. We use this to build
 * a partial contribution calendar, padded with zeros for older dates.
 */

import { levelForCount } from "@/lib/github-sample-data";
import type { ContributionDay, ContributionYear } from "@/lib/github";

type GithubEvent = {
  created_at: string;
  type: string;
};

export async function fetchGithubContributionsFromEvents(
  username: string
): Promise<ContributionYear | null> {
  try {
    // Fetch up to 100 events (3 pages × 30 = ~90 days of activity)
    const events: GithubEvent[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "musa-khan-portfolio",
          },
          next: { revalidate: 3600 },
        }
      );
      if (!res.ok) break;
      const pageEvents = (await res.json()) as GithubEvent[];
      if (!Array.isArray(pageEvents) || pageEvents.length === 0) break;
      events.push(...pageEvents);
      if (pageEvents.length < 100) break;
    }

    if (events.length === 0) return null;

    // Count contributions per day
    const dayCounts = new Map<string, number>();
    for (const event of events) {
      const day = event.created_at.slice(0, 10); // "2026-08-30"
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }

    // Build a 53-week calendar ending today
    const today = new Date();
    const end = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // walk back to Sunday
    start.setUTCDate(start.getUTCDate() - 7 * 52); // 52 more weeks back

    const weeks: ContributionDay[][] = [];
    let total = 0;
    const cursor = new Date(start);

    while (cursor <= end) {
      const week: ContributionDay[] = [];
      for (let d = 0; d < 7; d++) {
        const isoDate = cursor.toISOString().slice(0, 10);
        const count = dayCounts.get(isoDate) || 0;
        total += count;
        week.push({
          date: isoDate,
          count,
          level: levelForCount(count),
        });
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
  } catch {
    return null;
  }
}
