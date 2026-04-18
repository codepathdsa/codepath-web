/**
 * lib/db/challenges.ts
 * Helpers for challenge progress (user_challenges) and XP awarding.
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

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
  const session = await auth();
  if (!session?.user?.id) return {};

  const data = await sql`
    SELECT * FROM user_challenges
    WHERE user_id = ${session.user.id}
  `;

  if (!data) return {};
  return Object.fromEntries(data.map((r: any) => [r.challenge_id, r as UserChallenge]));
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
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };
  const userId = session.user.id;

  try {
    // Call the atomic PL/pgSQL function directly via SELECT
    await sql`SELECT award_xp(${userId}, ${params.xp}, ${params.challengeId}, ${params.type})`;

    // Update score/time on the newly-created row
    if (params.score !== undefined || params.timeTakenSeconds !== undefined) {
      const status = params.score === 100 ? 'perfect' : 'solved';
      await sql`
        UPDATE user_challenges
        SET score = ${params.score}, time_taken_s = ${params.timeTakenSeconds}, status = ${status}
        WHERE user_id = ${userId} AND challenge_id = ${params.challengeId}
      `;
    }

    // Log to activity feed
    if (params.activityTitle) {
      await sql`
        INSERT INTO user_activities (user_id, type, challenge_id, title, description, xp, stats)
        VALUES (${userId}, ${params.type}, ${params.challengeId}, ${params.activityTitle}, ${params.activityDesc ?? null}, ${params.xp}, ${params.activityStats ? JSON.stringify(params.activityStats) : '[]'}::jsonb)
      `;
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}
