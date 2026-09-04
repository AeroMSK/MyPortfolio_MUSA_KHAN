/**
 * GitHub data abstraction.
 *
 * Three layers:
 *   1. fetchGithubUser(username) — REST GET /users/{username}.
 *      Works without auth (60 req/hr per IP). With GITHUB_TOKEN, 5000/hr.
 *   2. fetchGithubContributions(username) — requires GITHUB_TOKEN because
 *      the contributions calendar is only available through the GraphQL
 *      API. Without a token, returns null (caller falls back to sample).
 *   3. Sample data (@/lib/github-sample-data) — deterministic 53-week
 *      calendar used when the username is still a placeholder OR when
 *      the real API call fails.
 */

import { levelForCount } from "@/lib/github-sample-data";

// ============================================================
// Types
// ============================================================
export type ContributionDay = {
  /** ISO date string, e.g. "2026-03-14" */
  date: string;
  /** Contribution count for that day */
  count: number;
  /** Intensity bucket 0–4 used to pick a cell color in the grid */
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionYear = {
  /** Calendar year this contribution set ends in */
  year: number;
  /** Total contributions across all visible weeks */
  total: number;
  /** 53 weeks × 7 days = 371 cells (some trailing days may be in the future) */
  weeks: ContributionDay[][];
};

export type GithubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  following: number;
  publicRepos: number;
};

// ============================================================
// GraphQL query (contributions calendar)
// ============================================================
const CONTRIBUTION_QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      followers { totalCount }
      following { totalCount }
      repositories(privacy: PUBLIC, first: 1) { totalCount }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

// ============================================================
// fetchGithubContributions — GraphQL, requires token
// ============================================================
export async function fetchGithubContributions(
  username: string,
  token?: string
): Promise<ContributionYear | null> {
  const accessToken = token ?? process.env.GITHUB_TOKEN;
  if (!accessToken) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "musa-khan-portfolio",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { login: username },
      }),
      // Next.js fetch cache — revalidate hourly
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks: Array<{
                contributionDays: Array<{
                  contributionCount: number;
                  date: string;
                  weekday: number;
                }>;
              }>;
            };
          };
        };
      };
      errors?: unknown;
    };

    if (json.errors || !json.data?.user) return null;

    const cal = json.data.user.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    const weeks: ContributionDay[][] = cal.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: levelForCount(d.contributionCount),
      }))
    );

    const firstDate = weeks[0]?.[0]?.date;
    const year = firstDate
      ? new Date(firstDate).getUTCFullYear()
      : new Date().getUTCFullYear();

    return {
      year,
      total: cal.totalContributions ?? 0,
      weeks,
    };
  } catch {
    return null;
  }
}

// ============================================================
// fetchGithubUser — REST (no token required for public users)
// ============================================================
export async function fetchGithubUser(
  username: string,
  token?: string
): Promise<GithubUser | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "musa-khan-portfolio",
  };
  const accessToken = token ?? process.env.GITHUB_TOKEN;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const j = (await res.json()) as {
      login: string;
      name?: string | null;
      avatar_url: string;
      bio?: string | null;
      followers?: number;
      following?: number;
      public_repos?: number;
    };

    return {
      login: j.login,
      name: j.name ?? null,
      avatarUrl: j.avatar_url,
      bio: j.bio ?? null,
      followers: j.followers ?? 0,
      following: j.following ?? 0,
      publicRepos: j.public_repos ?? 0,
    };
  } catch {
    return null;
  }
}

// ============================================================
// fetchGithubProfile — convenience: user + contributions in parallel
// ============================================================
export async function fetchGithubProfile(
  username: string,
  token?: string
): Promise<{ user: GithubUser | null; contributions: ContributionYear | null }> {
  const [user, contributions] = await Promise.all([
    fetchGithubUser(username, token),
    fetchGithubContributions(username, token),
  ]);
  return { user, contributions };
}

// Re-export the shared level helper for UI consumers
export { levelForCount };
