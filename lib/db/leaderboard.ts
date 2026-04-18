/**
 * lib/db/leaderboard.ts
 * Fetches from the leaderboard_view (no PII exposed beyond username/displayName).
 */
import { createClient } from '@/utils/supabase/server';

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit);

  return {
    rows: (data ?? []) as LeaderRow[],
    myId: user?.id ?? null,
  };
}
