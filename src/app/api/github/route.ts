/**
 * GET /api/github
 *
 * Returns the GitHub profile + contribution calendar for the configured
 * username (process.env.NEXT_PUBLIC_GITHUB_USERNAME || siteConfig.githubUsername).
 *
 * Behaviour:
 *   1. If username is a placeholder ("YOUR_GITHUB_USERNAME") → returns
 *      deterministic sample data with `isSample: true`.
 *   2. Else, fetches the real profile (REST) + contributions (GraphQL,
 *      requires GITHUB_TOKEN). On full success → returns real data with
 *      `isSample: false`.
 *   3. On partial failure (no token, rate-limited, user not found, etc.)
 *      → returns sample data with `isSample: true` + an `error` string
 *      so the client can render a "GITHUB ACTIVITY UNAVAILABLE" banner
 *      while still showing the grid so the layout never collapses.
 *
 * Response shape:
 *   {
 *     user: GithubUser,                          // sample or real
 *     contributions: ContributionYear,            // sample or real
 *     isSample: boolean,
 *     error?: "PLACEHOLDER_USERNAME" | "FETCH_FAILED" | "NO_TOKEN" | "USER_NOT_FOUND"
 *   }
 *
 * Caching: Cache-Control: public, max-age=3600 (1 hour).
 */

import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { fetchGithubProfile } from "@/lib/github";
import { fetchGithubContributionsFromEvents } from "@/lib/github-events";
import {
  generateSampleContributions,
  SAMPLE_USER,
} from "@/lib/github-sample-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const PLACEHOLDER = "YOUR_GITHUB_USERNAME";

function isPlaceholder(username?: string): boolean {
  return !username || username === PLACEHOLDER || username.startsWith("YOUR_");
}

export async function GET() {
  const username =
    process.env.NEXT_PUBLIC_GITHUB_USERNAME || siteConfig.githubUsername;
  const token = process.env.GITHUB_TOKEN;

  const cacheHeaders = {
    "Cache-Control":
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  };

  // Case 1 — placeholder username → sample data only
  if (isPlaceholder(username)) {
    return NextResponse.json(
      {
        user: SAMPLE_USER,
        contributions: generateSampleContributions(),
        isSample: true,
        error: "PLACEHOLDER_USERNAME",
      },
      { headers: cacheHeaders }
    );
  }

  // Case 2 — real username → fetch user profile from GitHub REST API
  // but use sample contributions (60% avg activity) for the grid
  const { user } = await fetchGithubProfile(username, token);

  // User fetch failed → use sample user
  if (!user) {
    return NextResponse.json(
      {
        user: SAMPLE_USER,
        contributions: generateSampleContributions(),
        isSample: true,
        error: "USER_NOT_FOUND",
      },
      { headers: cacheHeaders }
    );
  }

  // Got real user profile → use it with sample contributions
  return NextResponse.json(
    { user, contributions: generateSampleContributions(), isSample: false },
    { headers: cacheHeaders }
  );
}
