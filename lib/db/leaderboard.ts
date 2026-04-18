/**
 * lib/db/leaderboard.ts
 * Fetches from the leaderboard_view (no PII exposed beyond username/displayName).
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export interface LeaderRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_color: string;
  subscription_tier: string;
  total_xp: number;
  current_streak: number;
  challenges_done: number;
  war_rooms_done: number;
  perfect_runs: number;
  rank: number;
}

export async function getLeaderboard(limit = 50): Promise<{ rows: LeaderRow[]; myId: string | null }> {
  const session = await auth();

  const data = await sql`
    SELECT * FROM leaderboard_view
    ORDER BY rank ASC
    LIMIT ${limit}
  `;

  return {
    rows: (data ?? []) as LeaderRow[],
    myId: session?.user?.id ?? null,
  };
}
