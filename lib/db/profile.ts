/**
 * lib/db/profile.ts
 * Server-side helpers for user_profiles + user_stats.
 * All functions require an authenticated Supabase client.
 */
import { createClient } from '@/utils/supabase/server';

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, stats: null };

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_stats').select('*').eq('id', user.id).single(),
  ]);

  return { profile: profile as UserProfile | null, stats: stats as UserStats | null };
}

/** Update mutable profile fields */
export async function updateProfile(updates: Partial<Pick<UserProfile, 
  'display_name' | 'username' | 'track' | 'target_companies' | 'avatar_color' | 'starter_creature' | 'onboarding_complete'
>>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id);

  return { error: error?.message ?? null };
}
