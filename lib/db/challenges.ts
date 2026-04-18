/**
 * lib/db/challenges.ts
 * Helpers for challenge progress (user_challenges) and XP awarding.
 */
import { createClient } from '@/utils/supabase/server';

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'in_progress' | 'solved' | 'perfect';
  score: number | null;
  xp_earned: number;
  time_taken_s: number | null;
  solved_at: string;
}

/** Returns a map of challengeId → UserChallenge for the current user */
export async function getMyChallengeProgress(): Promise<Record<string, UserChallenge>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from('user_challenges')
    .select('*')
    .eq('user_id', user.id);

  if (!data) return {};
  return Object.fromEntries(data.map((r: UserChallenge) => [r.challenge_id, r]));
}

/** 
 * Mark a challenge solved and award XP.
 * Calls the award_xp database function which handles streak + dedup atomically.
 */
export async function solveChallenge(params: {
  challengeId: string;
  xp: number;
  type: 'dsa' | 'war' | 'pr' | 'design' | 'tribunal';
  score?: number;
  timeTakenSeconds?: number;
  activityTitle?: string;
  activityDesc?: string;
  activityStats?: { label: string; value: string }[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Call the atomic PL/pgSQL function
  const { error: xpError } = await supabase.rpc('award_xp', {
    p_user_id: user.id,
    p_xp: params.xp,
    p_challenge_id: params.challengeId,
    p_challenge_type: params.type,
  });

  if (xpError) return { error: xpError.message };

  // Update score/time on the newly-created row
  if (params.score !== undefined || params.timeTakenSeconds !== undefined) {
    await supabase
      .from('user_challenges')
      .update({
        score: params.score,
        time_taken_s: params.timeTakenSeconds,
        status: params.score === 100 ? 'perfect' : 'solved',
      })
      .eq('user_id', user.id)
      .eq('challenge_id', params.challengeId);
  }

  // Log to activity feed
  if (params.activityTitle) {
    await supabase.from('user_activities').insert({
      user_id: user.id,
      type: params.type,
      challenge_id: params.challengeId,
      title: params.activityTitle,
      description: params.activityDesc ?? null,
      xp: params.xp,
      stats: params.activityStats ?? [],
    });
  }

  return { error: null };
}
