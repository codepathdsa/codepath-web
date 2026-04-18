/**
 * lib/db/profile.ts
 * Server-side helpers for user_profiles + user_stats.
 * All functions require an authenticated Supabase client.
 */
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_color: string;
  track: string;
  target_companies: string[];
  starter_creature: string | null;
  referral_code: string | null;
  is_premium: boolean;
  subscription_tier: 'free' | 'pro' | 'legendary';
  subscription_renews_at: string | null;
  onboarding_complete: boolean;
}

export interface UserStats {
  id: string;
  total_xp: number;
  challenges_done: number;
  war_rooms_done: number;
  pr_reviews_done: number;
  perfect_runs: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

/** Fetch the current user's profile + stats in one go */
export async function getMyProfile(): Promise<{ profile: UserProfile | null; stats: UserStats | null }> {
  const session = await auth();
  if (!session?.user?.id) return { profile: null, stats: null };

  const [profileRows, statsRows] = await Promise.all([
    sql`SELECT * FROM user_profiles WHERE id = ${session.user.id}`,
    sql`SELECT * FROM user_stats WHERE id = ${session.user.id}`,
  ]);

  return { 
    profile: (profileRows[0] as UserProfile) ?? null, 
    stats: (statsRows[0] as UserStats) ?? null 
  };
}

/** Update mutable profile fields */
export async function updateProfile(updates: Partial<Pick<UserProfile, 
  'display_name' | 'username' | 'track' | 'target_companies' | 'avatar_color' | 'starter_creature' | 'onboarding_complete'
>>) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };

  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return { error: null };
    
    // Simplistic handling of update via sql tagged template
    // Since Neon template tag doesn't easily do dynamic keys safely out of the box, we construct it:
    await sql`
      UPDATE user_profiles SET
        display_name = COALESCE(${updates.display_name ?? null}, display_name),
        username = COALESCE(${updates.username ?? null}, username),
        track = COALESCE(${updates.track ?? null}, track),
        avatar_color = COALESCE(${updates.avatar_color ?? null}, avatar_color),
        starter_creature = COALESCE(${updates.starter_creature ?? null}, starter_creature),
        onboarding_complete = COALESCE(${updates.onboarding_complete ?? null}, onboarding_complete)
      WHERE id = ${session.user.id}
    `;
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getPublicProfile(username: string): Promise<{ profile: UserProfile | null; stats: UserStats | null }> {
  const profileRows = await sql`SELECT * FROM user_profiles WHERE username = ${username}`;
  const profile = profileRows[0];
  if (!profile) return { profile: null, stats: null };
  
  const statsRows = await sql`SELECT * FROM user_stats WHERE id = ${profile.id}`;
  const stats = statsRows[0];
  
  return { profile: profile as UserProfile, stats: (stats as UserStats) ?? null };
}
